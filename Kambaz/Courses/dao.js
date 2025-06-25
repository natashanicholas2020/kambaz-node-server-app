import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function findAllCourses() {
  return model.find();
}

export function findCoursesForEnrolledUser(userId) {
  const { courses, enrollments } = Database;
  const enrolledCourses = courses.filter((course) =>
    enrollments.some((enrollment) => enrollment.user === userId && enrollment.course === course._id));
  return enrolledCourses;
}

export function createCourse(course) {
  // Ensure a unique ID is set if not provided
  if (!course._id) {
    course._id = uuidv4();
  }
  return model.create(course);
}

export function deleteCourse(courseId) {
  return model.deleteOne({ _id: courseId });
 } 

export function updateCourse(courseId, courseUpdates) {
  return model.updateOne({ _id: courseId }, { $set: courseUpdates });
}


