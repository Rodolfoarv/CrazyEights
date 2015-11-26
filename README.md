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

###Text
+ put_card: Se está desplegando null en algunas cartas, verificarlo
+ Método que termina el juego cuando algun jugador se queda sin cartas
+ Modificar en la validación que el 8 sea un caso especial que siempre aplique y que el usuario escoga la denominación
+ Mejorar la interface que despliegue errores dependiendo de la acción y que sean responsivos e.g cuando quiere agregar una carta incorrecta
+ Modificar que solo pueda agregar 3 cartas en un Pick

###Web
+ Start game, que se despliegue la alerta siempre y no desaparezca al segundo startgame
+ Desplegar errores cuando ya se creo un nombre con ese mismo nombre o caracteres inválidos


## Authors

- Rodolfo Andrés Ramírez Valenzuela
- Luis Ballinas
- Enrique Scherer

## License

See [LICENSE] (https://github.com/Rodolfoarv/CrazyEights/blob/master/LICENSE)
