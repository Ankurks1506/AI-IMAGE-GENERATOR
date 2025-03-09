const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const {moveFile} =require('move-file');


const app = express();
const port = 1000;

app.set('view engine', 'ejs');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'generated_images' directory
app.use( express.static("public"));

app.get('/', async (req, res) => {
  res.render("index")
})



// Endpoint to generate images
app.get('/generate-image', async (req, res) => {
    const  prompt  = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
            text_prompts: [{ text: prompt }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'accept':'application/json'
                
            },
          
        }
    );

    const imgurl=response.data.artifacts[0].base64;

    const buffer = Buffer.from(imgurl, "base64")
    //fs.appendFile('generated_image.png', 'Hello content!')
    await fs.writeFileSync("generate_image.png", buffer);
    await moveFile('./generate_image.png', './public/generate_image.png');
    
    res.render("generate")
       
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});