const assignment = {
    id: 1, title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-10-10", completed: false, score: 0,
  };

const module = {
    id: 1, name: "Module 1",
    description: "Create a NodeJS server with ExpressJS",
    course: "1234",
  };

  export default function WorkingWithObjects(app) {
    app.get("/lab5/assignment", (req, res) => {
      res.json(assignment);
    });

    app.get("/lab5/assignment/title", (req, res) => {
        res.json(assignment.title);
      });
    
    app.get("/lab5/assignment/title/:newTitle", (req, res) => {
        const { newTitle } = req.params;
        assignment.title = newTitle;
        res.json(assignment);
      });

    app.get("/lab5/assignment/score/:score", (req, res) => {
        assignment.score = parseInt(req.params.score);
        res.send(assignment);
      });
      
    app.get("/lab5/assignment/completed/:completed", (req, res) => {
        assignment.completed = req.params.completed === "true";
        res.send(assignment);
      });

    app.get("/lab5/module", (req, res) => {
        res.json(module);
      });
  
    app.get("/lab5/module/name", (req, res) => {
          res.json(module.name);
        });
      
    app.get("/lab5/module/name/:newName", (req, res) => {
          const { newName } = req.params;
          module.name = newName;
          res.json(module);
        });
    
  };
  