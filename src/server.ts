import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000
const app = express()
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_req, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc',
        },
        include: {
            genres: true,
            languages: true
        }
    });
    res.json(movies)
});

app.post("/movies", async (req, res) => {

    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try{
    await prisma.movie.create({
        data: {
            title,  // Essa e as propriedades abaixo ficariam title: title e assim por diante, quando são iguais podemos colocar somente uma, ficando assim como estamos vendo.
            genre_id,
            language_id,
            oscar_count,
            release_date: new Date(release_date)
        }
    });
    }catch(error){
        return res.status(500).send({message: "Falha ao cadastrar um filme"})
    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Servidor inicializado em http://localhost:${port}`);
});
