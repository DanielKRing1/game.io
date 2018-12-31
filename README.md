# game.io
<h3>Clone of Agario, made with SocketIO and Express.<br/> Nothing fancy.</h3>
Currently supports movement with WASD and... that's really it. There isn't any functionality for splitting your player yet.
Absorb Food pieces. Absorb other Players.
Get Bigger.

<h3>Prerequisites</h3>
> <b>Install Node</b> from https://nodejs.org/en/
<h3>Setup</h3>
> <b>Clone this repo</b> </br>
> Open your terminal and <b>cd into the cloned Repo</b> </br>
> Run <b>'npm install'</b> from your terminal (this will install Express, SocketIO, and the rest of this project's dependencies)

<h3>Demo</h3>
This repo is currently hosted on Heroku at https://glacial-everglades-65673.herokuapp.com/</br></br>
It is VERY laggy. But it runs fine on my laptop's localhost, using only</br>
~20% CPU for the Client and</br>
~5% CPU for the Server to handle that single Client

<h3>How this was built</h3>

<h4>QUAD TREES</h4>
If you're interested in how I added collision detection, I used QuadTrees:</br>
Basically a tree whose nodes each have 4 children, corresponding to the 4 quadrants of a square.</br>
Once X players exist within a QuadTree/Square, it splits into 4 new QuadTrees/Quadrants.</br>
Once X players exist within one of the new QuadTrees, it will split further into 4 more QuadTrees and so on.</br></br>

The QuadTree splits the game space into smaller, more manageable chunks, so when checking for collisions with other objects,
instead of checking against every other game object, O(n^2),
the QuadTree only returns POTENTIAL collisions aka nearby game objects, O(n^2/k),
a noticeable difference when dealing with thousand of objects.</br>

<h4>DELEGATE WORK TO THE CLIENTS</h4>
To further reduce the strain on the server, I have delegated the job of checking for any collisions against a player to the player's client,
who in turn returns a list of all collisions against their player to my server.</br>
THEN, on my server, I VERIFY that those collisions exist.</br>

<h4>VERIFY CLIENT'S WORK</h4>
In short, the clients do not have access to data on my server. The server will always verify a client's claim of collision.</br></br>
Doing this simply relieves the burden on my server's CPU, since each client is limited to returning <= n collisions,
so in the end the server will verify <= n^2 collisions</br>
(most likely MUCH less than n^2, given that the number of possible collisions is usually much less than the total game objects to check).</br></br>

<h4>Future Additions</h4>
1. Only in the event of a malicious player would the server recieve > n collisions... and possibly crash my server...</br>
(I'll fix this by adding a check that a client should not return > n collisions and kick any player that does)</br></br>
2. Normalize direction vector, i.e. same speed regardless of direction</br></br>
3. Move with mouse rather than WASD</br></br>
4. Split character</br></br>
5. Handle Player collision with self after splitting</br></br>
