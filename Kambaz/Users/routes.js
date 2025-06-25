import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {

  // Create user (basic)
  const createUser = async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      res.json(user);
    } catch (e) {
      console.error("Error creating user:", e);
      res.status(500).json({ message: "Server error creating user" });
    }
  };

  // Delete user by ID
  const deleteUser = async (req, res) => {
    try {
      await dao.deleteUser(req.params.userId);
      res.sendStatus(204);
    } catch (e) {
      console.error("Error deleting user:", e);
      res.status(500).json({ message: "Server error deleting user" });
    }
  };

  // Find all users
  const findAllUsers = async (req, res) => {
    try {
      const users = await dao.findAllUsers();
      console.log("findAllUsers:", users);
      res.json(users);
    } catch (e) {
      console.error("Error in findAllUsers:", e);
      res.status(500).json({ message: "Server error fetching users" });
    }
  };

  // Find user by ID
  const findUserById = async (req, res) => {
    try {
      const user = await dao.findUserById(req.params.userId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (e) {
      console.error("Error finding user by ID:", e);
      res.status(500).json({ message: "Server error fetching user" });
    }
  };

  // Update user by ID
  const updateUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const userUpdates = req.body;
      await dao.updateUser(userId, userUpdates);
      const updatedUser = await dao.findUserById(userId);
      req.session["currentUser"] = updatedUser;
      res.json(updatedUser);
    } catch (e) {
      console.error("Error updating user:", e);
      res.status(500).json({ message: "Server error updating user" });
    }
  };

  // Signup
  const signup = async (req, res) => {
    try {
      const existingUser = await dao.findUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already in use" });
      }
      const newUser = await dao.createUser(req.body);
      req.session["currentUser"] = newUser;
      res.json(newUser);
    } catch (e) {
      console.error("Error in signup:", e);
      res.status(500).json({ message: "Server error signing up" });
    }
  };

  // Signin
  const signin = async (req, res) => {
    try {
      const { username, password } = req.body;
      const currentUser = await dao.findUserByCredentials(username, password);
      if (currentUser) {
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (e) {
      console.error("Error in signin:", e);
      res.status(500).json({ message: "Server error signing in" });
    }
  };

  // Signout
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  // Profile - current logged-in user
  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.sendStatus(401);
    }
    res.json(currentUser);
  };

  // Find courses for enrolled user
  const findCoursesForEnrolledUser = async (req, res) => {
    try {
      let { userId } = req.params;
      if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          return res.sendStatus(401);
        }
        userId = currentUser._id;
      }
      const courses = await courseDao.findCoursesForEnrolledUser(userId);
      res.json(courses);
    } catch (e) {
      console.error("Error fetching courses for enrolled user:", e);
      res.status(500).json({ message: "Server error fetching courses" });
    }
  };

  // Create course and enroll current user
  const createCourse = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.sendStatus(401);
      }
      const newCourse = await courseDao.createCourse(req.body);
      await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
      res.json(newCourse);
    } catch (e) {
      console.error("Error creating course:", e);
      res.status(500).json({ message: "Server error creating course" });
    }
  };

  // Test route: list all users directly from model
  app.get("/api/test/users", async (req, res) => {
    try {
      const users = await dao.findAllUsers();
      console.log("Test users:", users);
      res.json(users);
    } catch (e) {
      console.error("Error fetching users in test route:", e);
      res.status(500).json({ message: "Server error fetching users" });
    }
  });

  // Bind routes
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);

  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);

  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.post("/api/users/current/courses", createCourse);
}
