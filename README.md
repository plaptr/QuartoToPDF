# Quarto to PDF

A simple web service to convert Quarto documents to PDF using [Quarto](https://quarto.org/).

## Run with Docker

Create an image with

```bash
docker build -t quarto-to-pdf
```

Then run a container with

```bash
docker run -p 3000:3000 quarto-to-pdf
```

Now you can access the service at `http://localhost:3000`.
