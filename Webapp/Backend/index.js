import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.json(
        {
            status: 'success',
            message: 'Hello World !',
            app: 'RIHNO Backend',
            port: process.env.PORT || 3000,
        }
    )
});

app.listen(3000, () => console.log('RIHNO backend server started on port 3000'));