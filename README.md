# Meta-Benjolin

The Meta-Benjolin is a screen-based notation system and a meta-instrument, developed as a control structure for the Benjolin, a chaotic synthesizer.

![alt text](https://github.com/vincenzomadaghiele/Latent-benjolin-interface/blob/main/frontend/Meta-Benjo.png)

## Installing Dependencies

### Python
Download the git repository as:
```
git clone https://github.com/vincenzomadaghiele/Latent-benjolin-interface
```
In the terminal, run: 
```
cd Latent-benjolin-interface
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

To run the demo, we need <b>three separate terminals</b>b> to be open at the same time. These terminals will run, in parallel:

##### 1. A python server, which communicates with PD through OSC protocol:

```
cd Latent-benjolin-interface
cd python_server
conda activate benjo
python3 latent_space_class.py
```

##### 2. A node server, which relays messages from the browser to the python server:

```
cd Latent-benjolin-interface
cd node_server
node .
```

##### 3. A Pure Data benjolin, which receives control parameters and synthesizes sound. 
Open the patch <code>pure-data-benjo-2024.pd</code>.

##### 4. A user interface, which sends controls to the benjolin.

```
cd Latent-benjolin-interface
cd frontend
npx vite
```
