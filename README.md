# Crazy-Eights Game

This application was developed by Rodolfo Andrés Ramírez Valenzuela
as part of the Web Development class.

The application lets you play the Crazy-Eights card game, it uses the following technologies.

+ NodeJS
+ Bootstrap and Jquery
+ EJS (Embedded JavaScript)
+ Javascript
+ CSS and HTML

## Installing the application
    # Setup the project
    Clone the repository and execute the following commands:
    sudo npm install

    # Run application
    sudo npm start

    #Web Client
    Once the app is running you can access it from: <http://localhost:3000/>

    #Text Client
    You can access the text-client using the following command npm run-script client

## TODO

+ put_card: Se está desplegando null en algunas cartas, verificarlo
+ Habilitar opción para el master del juego de empezar el juego con 2 o más jugadores
+ Habilitar que el juego acepte como maximo 5 jugadores y minimo 2 jugadores antes de habilitar la opción al master
+ Método que termina el juego cuando algun jugador se queda sin cartas
+ Modificar en la validación que el 8 sea un caso especial que siempre aplique y que el usuario escoga la denominación
+ Mejorar la interface que despliegue errores dependiendo de la acción y que sean responsivos e.g cuando quiere agregar una carta incorrecta
+ Modificar que solo pueda agregar 3 cartas en un Pick


## Authors

- Rodolfo Andrés Ramírez Valenzuela

## License

See [LICENSE] (https://github.com/Rodolfoarv/CrazyEights/blob/master/LICENSE)
