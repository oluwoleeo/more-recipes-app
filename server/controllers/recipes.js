import dbs from '../models';

const Recipe=dbs.Recipe;
const Review=dbs.Review;

export default {
    create:(req, res)=>{
      return Recipe
        .create({
          title: req.body.title,
          content: req.body.content,
          ingredients:req.body.ingredients,
          creatorId: req.body.creatorId,
          upvotes:0,
          downvotes:0,
        })
        .then(recipe => res.status(201).json(recipe))
        .catch(error =>res.status(400).json({detail:error.parent.detail}))
  },

  list:(req, res)=>{
    return Recipe
      .findAll({
        include: [{
          model: Review,
          as:'reviews'
        }]
      })
      .then(recipes => res.status(201).json(recipes))
      .catch(error => res.status(400).json(error));
  },

  listByUpvotes:(req, res)=>{
    return Recipe
      .findAll({
        include: [{
          model: Review,
          as:'reviews'
        }],
        order:['upvotes','DESC'],limit:3
      })
      .then(recipes => res.status(200).json(recipes))
      .catch(error => res.status(400).json({error}));
  },
  listDummy:(req,res)=>{
    if (req.query && req.query.sort)
       {
         if (req.query.order && req.query.order === "asc")
           recipes.sort((a, b)=> {
             return a.upvotes - b.upvotes
            });
    
          if (req.query.order && req.query.order === "des") 
          {
            recipes.sort((a, b)=>{ 
              return b.upvotes - a.upvotes 
            });
          }
        }
    
      return res.status(200).json(recipes)
  },

  update:(req,res)=>{
    return Recipe
        .findById(req.params.recipeId)
        .then(
          recipe=>{
            if (!recipe)
              return res.status(404).json({message: 'Recipe Not Found'});

          return recipe.update(req.body,{fields:Object.keys(req.body)})
          .then(() => res.status(201).json(recipe))
          .catch((error) => res.status(400).json({detail:error.parent.detail}));
        })
        .catch((error) => res.status(400).json({detail:error.parent.detail}));
  },

  delete:(req,res)=>{
    return Recipe
    .findById(req.params.recipeId)
    .then(
      recipe=>{
        if (!recipe)
          return res.status(404).json({message: 'Recipe Not Found'});

          return recipe.destroy()
          .then(() => res.status(200).json({message: 'Recipe Deleted Successfully'}))
          .catch((error) => res.status(400).json({detail:error.parent.detail}));
    })
    .catch((error) => res.status(400).json({detail:error.parent.detail}));
  }
};