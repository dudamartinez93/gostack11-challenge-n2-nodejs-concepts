const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function middlewareValidateUuid(request, response, next){

  const { id } = request.params;

  if(!isUuid(id)) {
    return response.status(400).json({error: 'Invalid ID'});
  }

  return next();

}

function middlewareCheckExistingRepository(request, response, next){
  const { id } = request.params;

  const checkedRepositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(checkedRepositoryIndex < 0) response.status(400).json({error: 'Repository not found'});
  
  response.locals.checkedRepositoryIndex = checkedRepositoryIndex;
  next();
}

app.use('/repositories/:id', middlewareValidateUuid, middlewareCheckExistingRepository);


app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const id = uuid();

  const newRepository = {
    id,
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(newRepository);

  return response.json(newRepository);

});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs} = request.body;
  
  const updatedRepositoryIndex = response.locals.checkedRepositoryIndex;

  const updatedRepository = {
    id,
    title,
    url,
    techs,
    likes: repositories[updatedRepositoryIndex].likes
  }

  repositories[updatedRepositoryIndex] = updatedRepository;

  return response.json(updatedRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const deletedRepositoryIndex = response.locals.checkedRepositoryIndex;

  repositories.splice(deletedRepositoryIndex, 1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const likedRepositoryIndex = response.locals.checkedRepositoryIndex;

  const likedRepository = repositories[likedRepositoryIndex];
  likedRepository.likes++;

  return response.json(likedRepository);

});

module.exports = app;
