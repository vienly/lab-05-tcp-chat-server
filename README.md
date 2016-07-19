![cf](https://i.imgur.com/7v5ASc8.png) lab-06-tcp-chat-server
======

## To Submit this Assignment
  * fork this repository
  * write all of your code in a directory named `lab-` + `<your name>` **e.g.** `lab-duncan`
  * push to your repository
  * submit a pull request to this repository
  * submit a link to your PR in canvas
  * write a how much time you spent, a question, and an observation on canvas 

## Project Structure
## Project Stucture
* Create these directores
 * lib -> for supporting modules
 * test -> for test files
* a main program called server.js
* Include a .gitignore
* Include the coures .eslintrc

## Directions
* Create a TCP Server use using the net module
* Create a ClientPool object constructor module that manages connected sockets 
 * The ClientPool should have a property name 'ee' that is a Node.js EventEmitter 
 * The ClientPool should have a property named `pool` that is of type _object_, for storing references to connected sockets
* When sockets connect to the server they should be added to an instance of ClientPool by emitting a `register` event
* When a socket emits the `close` event the socket should be removed from the ClientPool
* When sockets are registered with the ClientPool they should be given a randomly generated `id` that will be used as their key on the ClientPool's `pool` property, 
 * **e.g.** `user_230948023948` 
* When sockets are registered with the ClientPool they should be given a randomly generated `nickname` that should be used to identify who typed a message in the chat
 * **e.g.** `guest-43`
* When sockets are registered with the ClientPool they should be given event listeners for `data`, `error`, and `close` events
* The ClientPool should have a `broadcast` event that writes a messages to each client on the ClientPool's `pool` property
* When a socket sends a message (emits a data event) to the server, their message should be broadcast to all of the sockets in the ClientPool, by using the ClientPool's `broadcast` event that you created
* Every time a message is written to a socket it should print the `nickname` of the user who wrote the message 
 * **e.g** `guest-43: whats up?`

## Bonus
* **2pts** create an event that will rename a user's nickname when they type `\nick new-name` 
 * then use broadcast to inform all the users of the name change

