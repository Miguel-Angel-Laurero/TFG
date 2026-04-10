- Si se cambia la contraseña de algún usuario se debe de cerrar la sesión en el resto de dispositivos y que tenga que volver a iniciar sesión

- Cuando un usuario entra a la plataforma y reclama su recompensa diaria debe quedar registrado para que si vuelve a entrar desde otro dispositivo no le vuelva a salir y no se añada a las monedas

- Cuando le doy al perfil hace una ligera animación de ajustar como de estrecho están los iconos y el texto, eso hay que revisarlo

pdf propios y predefinidos ambas opciones para elegir

pdf propios --> gemini devuelve 50 preguntas (JSON) que se guarde en localStorage --> funcion filtrado al usuario se le muestran X aleatorias de esa cantidad, se generarán 15 números aleatorios que no puedan ser repetidos, se muestran esas preguntas

pdf predefinidos --> dejan tal y como están, no se implementa el algo

JSON que devuelve la primera llamada --> JSON se guarda en localStorage y en nube --> todo lo que se modifique es sobre el localStorage

Botón de guardar test para subir a la nube que es la base de datos de supabase, con esto se guardarían tanto el test como el resto de preguntas, todo esto para tener distintos JSON independientes, el objetivo es que el base que se genera por primera vez esté intacto y luego si se ha generado otra llamada con gemini para hacer nuevas preguntas quiero que esas preguntas también se suban en otro array distinto

Última sesión: pendiente de ver como calcular, en teoría una sesión desde que entra hsata que sale

En progreso en el banner donde pone admin debe salir el banner con la imagen que haya seleccionado el usuario

¿Se está usando editProfileContent y editProfileView pero el editProfile no sale?

En la pestaña de editar perfil avatar debe mostrar el icono de perfil y el banner actual (componente editProfile) no todos los avatares. Para cambiarlo el usuario debe darle a un botón de editar

editProfileView --> carga editProfileContent (avatar, nombre usuario etc) --> selector de avatar --> listado iconos

Debe salir una ventana para poder cambiar los iconos
