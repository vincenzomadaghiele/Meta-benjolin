# Latent benjolin interface

This code opens a Web Socket in a web page that communicates with a Node.js server.
The server is responsible for relaying OSC messages bidirectionally between the web page and the python server.

## Installing Dependencies

### Python
Download the git repository as:
```
git clone https://github.com/<folder>
```
In the terminal, run: 
```
cd <folder>
conda env create -f benjo_environment.yml
conda activate benjo
```

### Pure Data
Pure Data (PD) is an open source computer music environment, it can be downloaded [here](https://puredata.info/downloads). 
The `zexy` library for PD is used for OSC communication between python and PD; The `maxlib` library is used for utils function. They can be installed by typing `zexy`  and `maxlib` in the deken externals manager (`Help -> find externals`) and clicking on `install`.

### Node.js
Node.js is a scripting language for developing server-side javascript applications. It can be downloaded [here](https://nodejs.org/en). 
Check node.js and npm (node package manager) version:
```
node -v
npm -v
```
Once downloaded, to install the required packages run:
```
cd node_server
npm install
cd ..
cd frontend
npm install
```
You are good to go!
<b>If there are problems in the installation</b>, you can try to install dependencies separately by running:
```
cd frontend
npm install --save three 
npm install --save-dev vite
```
and:
```
cd node_server
npm i osc
```


## Running the demo

To run the demo, we need three terminals to be open at the same time. These terminals will run, in parallel:

##### 1. A python server, which communicates with PD through OSC protocol:

```
cd <folder>
cd python_server
conda activate benjo
python3 latent_space_class.py
```

##### 2. A node server, which relays messages from the browser to the python server:

```
cd <folder>
cd node_server
node .
```

##### 3. A Pure Data benjolin, which receives control parameters and synthesizes sound. Open the patch <code>pure-data-benjo-2024.pd</code>.

##### 4. A user interface, which sends controls to the benjolin.

```
cd <folder>
cd frontend
npx vite
```

### Known bugs
Known bugs (solving them at the moment):
- Path rendering on the point cloud is not accurate
- Playback when clicking on boxes does not have the same duration every time

