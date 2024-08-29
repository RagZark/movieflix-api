import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
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

    try {

        // verificando no bando se ja existe um filme com o mesmo nome que está sendo enviado
        // case insensitive - se a busca for feita por jhon wick ou Jhon Wick ou JHON WICK, o registro vai ser retornado na consulta
        // case sensitive - a diferenciação de escrita não vai ser resultado na consulta.

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" }
            }
        });

        if (movieWithSameTitle) {
            return res.status(409).send({ message: "Já existe um filme cadastrado com este título." });
        };

        await prisma.movie.create({
            data: {
                title,  // Essa e as propriedades abaixo ficariam title: title e assim por diante, quando são iguais podemos colocar somente uma, ficando assim como estamos vendo.
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
    };

    res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
    // pegar o id do registro que vai ser att
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id
            }
        });

        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" })
        };


        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        // pegar os dados do filme que será atualizado e atualizar ele no prisma
        await prisma.movie.update({
            where: { id },
            data: data
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar o registro do filme" })
    }

    // retornar o status correto informando que o filme foi atualizado
    res.status(200).send('Campo(s) modificado(s) com sucesso.');
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id)

    try {
        const movie = await prisma.movie.findUnique({
            where: { id }
        });

        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" })
        }

        await prisma.movie.delete({
            where: { id }
        });
    } catch (error) {
        res.status(500).send({ message: "Não foi possível remover o filme" })
    };

    res.status(200).send();
});

app.get("/movies/:genderName", async (req, res) => {
    const genderName = req.params.genderName
    try {
        const moviesFilteredByGenderName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: {
                        equals: genderName,
                        mode: "insensitive",
                    },
                },
            },
        });

        res.status(200).send(moviesFilteredByGenderName);
    } catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar um filme" });
    }

});

app.listen(port, () => {
    console.log(`Servidor inicializado em http://localhost:${port}`);
});
