<template>
    <table class="bg-gray-50 border-b-2 p-2 text-gray-800">
        <thead>
            <tr >
                <th v-for="header in headers">
                    {{header.nombre}}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="persona in nombres" >
                <td class="p-4">
                    {{ persona.nombre }}
                </td>
                <td class="p-4">
                    {{ persona.edad }}
                </td>
                <td class="p-4">
                    {{ persona.sexo }}
                </td>
            </tr>
        </tbody>
    </table>
    <!-- <Accordion value="0">
    <AccordionPanel value="0">
        <AccordionHeader>Header I</AccordionHeader>
        <AccordionContent>
            <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
        </AccordionContent>
    </AccordionPanel>
    <AccordionPanel value="1">
        <AccordionHeader>Header II</AccordionHeader>
        <AccordionContent>
            <p class="m-0">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
            </p>
        </AccordionContent>
    </AccordionPanel>
    <AccordionPanel value="2">
        <AccordionHeader>Header III</AccordionHeader>
        <AccordionContent>
            <p class="m-0">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa
                qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
            </p>
        </AccordionContent>
    </AccordionPanel>
</Accordion> -->
<div class="p-5">
    <input 
      v-model="nombre" 
      placeholder="Escribe tu nombre"
      class="border p-2 rounded"
    />
    
    <p class="mt-3">Tu nombre es: {{ nombre }} | {{ texto}}</p>
  </div>

</template>
<script setup>
import { computed, ref } from 'vue';

import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

//Esto seria back si estuviera bien hecho
const nombre=ref([]);
const headers= ref([
    {nombre: 'Nombre'},
    {nombre: 'Edad'},
    {nombre: 'Sexo'},
])
const nombres = ref([
    {nombre: 'Paque Fiestas' ,edad: 37, sexo:'no binarie'},
    {nombre: 'Jose Carlos',edad: 20, sexo:'Therian'},
    {nombre: 'Manu',edad: 37, sexo:'Hombre'},
    {nombre: 'Carlos',edad: 37, sexo:'Hombre'},
])

const texto = computed(() => {
    const cadena = `${nombre.value}- Sin nombre`;
    return cadena;
})
</script>