import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {

  // Create a course and enroll current user in it
  const createCourse = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const newCourse = await courseDao.createCourse(req.body);
      await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
      res.json(newCourse);
    } catch (error) {
      console.error("Error in createCourse:", error);
      res.status(500).json({ error: error.message });
    }
  };
  app.post("/api/users/current/courses", createCourse);

  // User CRUD operations

  const createUser = async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const status = await dao.deleteUser(req.params.userId);
      res.json(status);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const findAllUsers = async (req, res) => {
    try {
      const { role, name } = req.query;
      if (role) {
        const users = await dao.findUsersByRole(role);
        return res.json(users);
      }
      if (name) {
        const users = await dao.findUsersByPartialName(name);
        return res.json(users);
      }
      const users = await dao.findAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error finding users:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const findUserById = async (req, res) => {
    try {
      const user = await dao.findUserById(req.params.userId);
      if (!user) return res.sendStatus(404);
      res.json(user);
    } catch (error) {
      console.error("Error finding user by ID:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const userUpdates = req.body;
      await dao.updateUser(userId, userUpdates);

      const currentUser = req.session["currentUser"];
      if (currentUser && currentUser._id === userId) {
        req.session["currentUser"] = { ...currentUser, ...userUpdates };
      }
      res.json(req.session["currentUser"]);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Signup
  const signup = async (req, res) => {
    try {
      const user = await dao.findUserByUsername(req.body.username);
      if (user) {
        return res.status(400).json({ message: "Username already in use" });
      }
      const currentUser = await dao.createUser(req.body);
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Signin
  const signin = async (req, res) => {
    try {
      console.log("Signin request body:", req.body);
      const { username, password } = req.body;

      const user = await dao.findUserByUsername(username);
      console.log("User found by username:", user);

      if (!user || user.password !== password) {
        console.log("Invalid username or password.");
        return res.status(401).json({ message: "Invalid username or password." });
      }

      req.session["currentUser"] = user;
      res.json(user);
    } catch (error) {
      console.error("Error in signin:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Signout
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  // Get current user's profile
  const profile = async (req, res) => {
    console.log("Profile route hit, session:", req.session);
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      console.log("No current user in session");
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };

  // Fetch courses that the user is enrolled in
  const findCoursesForEnrolledUser = async (req, res) => {
    try {
      let { userId } = req.params;

      if (userId === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) return res.sendStatus(401);
        userId = currentUser._id;
      }

      const courses = await enrollmentsDao.findCoursesForUser(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses for user:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Enroll user in a course
  const enrollUserInCourse = async (req, res) => {
    try {
      let { uid, cid } = req.params;
      if (uid === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        uid = currentUser._id;
      }
      const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
      res.json(status);
    } catch (error) {
      console.error("Error enrolling user in course:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Unenroll user from a course
  const unenrollUserFromCourse = async (req, res) => {
    try {
      let { uid, cid } = req.params;
      if (uid === "current") {
        const currentUser = req.session["currentUser"];
        if (!currentUser) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        uid = currentUser._id;
      }
      const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
      res.json(status);
    } catch (error) {
      console.error("Error unenrolling user from course:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Routes

  app.post("/api/users/current/courses", createCourse);

  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  
  // Important: put the profile route before the dynamic :userId route
  app.get("/api/users/profile", profile);
  app.get("/api/users/:userId", findUserById);

  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);

  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);

  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);

  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
}
