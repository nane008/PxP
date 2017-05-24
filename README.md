# PxP
A game based on pixel color spread from a simple rectangle to a whole picture
The idea is to guess what is on the pixelised picture without fully revealing it.

Current version only supports including a picture and trying to guess what is on it.
It is enough to get the idea. However, the project will be developed further and it is currently being improved.

In order to run it, one needs to run a SQL database and include its login data in files: "index.js" and "convserv.js".
Another requirement is to have node.js installed in order to run the game server.
After completing the forementioned, one shall fill the database using the included converter. It is meant to be run offline for security reasons. Run it with a simple command:

node convserv.js

It will run the convert server on port 2999 and give feedback about the database status.
The address to be accessed from is: localhost:2999/converter.html
The function to use is "convert('someimage.jpg')"
Run it from the console using the path to your image and feedback with the result will be received.
Once the node.js console says "Image saved", you are ready to play.

Run the game server with the command line:

node index.js

It will also provide feedback so unknown errors are decreased.
One shall open port 3000 in order to share the game outside a NAT network. They can still play on: localhost:3000/game.html

Further development will include keywords checking and assessing and user login
After crucial parts of the project are finished, design and user interaction will be improved as well as including a home page.

We hope you enjoyed our project!
Dupla
