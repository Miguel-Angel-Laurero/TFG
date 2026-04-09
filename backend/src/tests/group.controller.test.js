// Unit tests for group.controller.js
// Models are mocked so no real database connection is needed

jest.mock("../models", () => ({
  Group: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  GroupMember: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  User: {},
}));

const { Group, GroupMember } = require("../models");
const {
  createGroup,
  getMyGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
} = require("../controllers/group.controller");

// Helper to build mock Express req/res/next
const buildReqRes = (overrides = {}) => {
  const req = {
    user: { id: 1, role: "user" },
    body: {},
    params: {},
    ...overrides,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── createGroup ─────────────────────────────────────────────────────────────

describe("createGroup", () => {
  it("returns 400 when name is missing", async () => {
    const { req, res, next } = buildReqRes({ body: {} });

    await createGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("nombre") })
    );
  });

  it("returns 400 when name is shorter than 3 characters", async () => {
    const { req, res, next } = buildReqRes({ body: { name: "ab" } });

    await createGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("creates a group and responds with 201", async () => {
    const createdGroup = { id: 10, name: "Mi Grupo", inviteCode: "uuid-1234" };
    const fullGroup = { ...createdGroup, creator: {}, members: [] };

    Group.create.mockResolvedValue(createdGroup);
    GroupMember.create.mockResolvedValue({});
    Group.findByPk.mockResolvedValue(fullGroup);

    const { req, res, next } = buildReqRes({
      body: { name: "Mi Grupo", description: "Desc", gameType: "quiz" },
    });

    await createGroup(req, res, next);

    expect(Group.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Mi Grupo", gameType: "quiz", createdBy: 1 })
    );
    expect(GroupMember.create).toHaveBeenCalledWith(
      expect.objectContaining({ groupId: 10, userId: 1, role: "owner" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fullGroup);
  });

  it("calls next with error when an exception is thrown", async () => {
    const error = new Error("DB error");
    Group.create.mockRejectedValue(error);

    const { req, res, next } = buildReqRes({ body: { name: "Valid Name" } });

    await createGroup(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

// ─── getMyGroups ──────────────────────────────────────────────────────────────

describe("getMyGroups", () => {
  it("returns the list of groups for the current user", async () => {
    const group1 = { id: 1, name: "Grupo A" };
    const group2 = { id: 2, name: "Grupo B" };
    GroupMember.findAll.mockResolvedValue([
      { group: group1 },
      { group: group2 },
    ]);

    const { req, res, next } = buildReqRes();

    await getMyGroups(req, res, next);

    expect(GroupMember.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
    expect(res.json).toHaveBeenCalledWith([group1, group2]);
  });

  it("calls next with error when an exception is thrown", async () => {
    const error = new Error("DB error");
    GroupMember.findAll.mockRejectedValue(error);

    const { req, res, next } = buildReqRes();

    await getMyGroups(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

// ─── getGroup ─────────────────────────────────────────────────────────────────

describe("getGroup", () => {
  it("returns 403 when user is not a member", async () => {
    GroupMember.findOne.mockResolvedValue(null);

    const { req, res, next } = buildReqRes({ params: { id: "5" } });

    await getGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("grupo") })
    );
  });

  it("returns 404 when the group does not exist", async () => {
    GroupMember.findOne.mockResolvedValue({ groupId: 5, userId: 1 });
    Group.findByPk.mockResolvedValue(null);

    const { req, res, next } = buildReqRes({ params: { id: "5" } });

    await getGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns the group when user is a member", async () => {
    const group = { id: 5, name: "Grupo Test", creator: {}, members: [] };
    GroupMember.findOne.mockResolvedValue({ groupId: 5, userId: 1 });
    Group.findByPk.mockResolvedValue(group);

    const { req, res, next } = buildReqRes({ params: { id: "5" } });

    await getGroup(req, res, next);

    expect(res.json).toHaveBeenCalledWith(group);
  });
});

// ─── joinGroup ────────────────────────────────────────────────────────────────

describe("joinGroup", () => {
  it("returns 400 when inviteCode is missing", async () => {
    const { req, res, next } = buildReqRes({ body: {} });

    await joinGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 when invite code is invalid", async () => {
    Group.findOne.mockResolvedValue(null);

    const { req, res, next } = buildReqRes({ body: { inviteCode: "bad-code" } });

    await joinGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 409 when user is already a member", async () => {
    Group.findOne.mockResolvedValue({ id: 7 });
    GroupMember.findOne.mockResolvedValue({ groupId: 7, userId: 1 });

    const { req, res, next } = buildReqRes({ body: { inviteCode: "valid-code" } });

    await joinGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("creates membership and responds with 201", async () => {
    const fullGroup = { id: 7, name: "Grupo", creator: {}, members: [] };
    Group.findOne.mockResolvedValue({ id: 7 });
    GroupMember.findOne.mockResolvedValue(null);
    GroupMember.create.mockResolvedValue({});
    Group.findByPk.mockResolvedValue(fullGroup);

    const { req, res, next } = buildReqRes({ body: { inviteCode: "valid-code" } });

    await joinGroup(req, res, next);

    expect(GroupMember.create).toHaveBeenCalledWith(
      expect.objectContaining({ groupId: 7, userId: 1, role: "member" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fullGroup);
  });
});

// ─── leaveGroup ───────────────────────────────────────────────────────────────

describe("leaveGroup", () => {
  it("returns 404 when user is not a member", async () => {
    GroupMember.findOne.mockResolvedValue(null);

    const { req, res, next } = buildReqRes({ params: { id: "3" } });

    await leaveGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("transfers ownership and removes member when owner leaves with other members", async () => {
    const membership = { role: "owner", destroy: jest.fn() };
    const otherMember = { userId: 2, update: jest.fn() };

    GroupMember.findOne
      .mockResolvedValueOnce(membership)
      .mockResolvedValueOnce(otherMember);

    Group.update = jest.fn();

    const { req, res, next } = buildReqRes({ params: { id: "3" } });

    await leaveGroup(req, res, next);

    expect(otherMember.update).toHaveBeenCalledWith({ role: "owner" });
    expect(membership.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it("deletes the group when the last owner leaves", async () => {
    const membership = { role: "owner", destroy: jest.fn() };

    GroupMember.findOne
      .mockResolvedValueOnce(membership)
      .mockResolvedValueOnce(null); // no other members

    Group.destroy = jest.fn();

    const { req, res, next } = buildReqRes({ params: { id: "3" } });

    await leaveGroup(req, res, next);

    expect(Group.destroy).toHaveBeenCalledWith({ where: { id: "3" } });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("eliminado") })
    );
  });

  it("removes a regular member from the group", async () => {
    const membership = { role: "member", destroy: jest.fn() };
    GroupMember.findOne.mockResolvedValue(membership);

    const { req, res, next } = buildReqRes({ params: { id: "3" } });

    await leaveGroup(req, res, next);

    expect(membership.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("abandonado") })
    );
  });
});

// ─── deleteGroup ──────────────────────────────────────────────────────────────

describe("deleteGroup", () => {
  it("returns 404 when group does not exist", async () => {
    Group.findByPk.mockResolvedValue(null);

    const { req, res, next } = buildReqRes({ params: { id: "99" } });

    await deleteGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 403 when user is not the owner", async () => {
    Group.findByPk.mockResolvedValue({ id: 99, createdBy: 999 });

    const { req, res, next } = buildReqRes({
      user: { id: 1, role: "user" },
      params: { id: "99" },
    });

    await deleteGroup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("allows admin to delete any group", async () => {
    const group = { id: 99, createdBy: 999, destroy: jest.fn() };
    Group.findByPk.mockResolvedValue(group);

    const { req, res, next } = buildReqRes({
      user: { id: 1, role: "admin" },
      params: { id: "99" },
    });

    await deleteGroup(req, res, next);

    expect(group.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("eliminado") })
    );
  });

  it("allows owner to delete their group", async () => {
    const group = { id: 5, createdBy: 1, destroy: jest.fn() };
    Group.findByPk.mockResolvedValue(group);

    const { req, res, next } = buildReqRes({
      user: { id: 1, role: "user" },
      params: { id: "5" },
    });

    await deleteGroup(req, res, next);

    expect(group.destroy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("eliminado") })
    );
  });
});
