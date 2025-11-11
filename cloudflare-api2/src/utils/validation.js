/**
 * Validation utility functions
 */

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username) {
  // Username: 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password) {
  // Password: at least 6 characters
  return password && password.length >= 6;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateGameData(gameData) {
  const errors = [];

  if (!gameData.title || gameData.title.trim() === "") {
    errors.push("Title is required");
  }

  if (gameData.rating !== undefined && gameData.rating !== null) {
    const rating = parseFloat(gameData.rating);
    if (isNaN(rating) || rating < 0 || rating > 10) {
      errors.push("Rating must be between 0 and 10");
    }
  }

  if (gameData.release_date && !isValidDate(gameData.release_date)) {
    errors.push("Invalid release date format");
  }

  return errors;
}

export function validateUserRegistration(userData) {
  const errors = [];

  const requiredError = validateRequired(userData.username, "Username");
  if (requiredError) errors.push(requiredError);
  else if (!validateUsername(userData.username)) {
    errors.push(
      "Username must be 3-20 characters, alphanumeric and underscore only",
    );
  }

  const emailError = validateRequired(userData.email, "Email");
  if (emailError) errors.push(emailError);
  else if (!validateEmail(userData.email)) {
    errors.push("Invalid email format");
  }

  const passwordError = validateRequired(userData.password, "Password");
  if (passwordError) errors.push(passwordError);
  else if (!validatePassword(userData.password)) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
}

export function validateUserLogin(userData) {
  const errors = [];

  const usernameError = validateRequired(userData.username, "Username");
  if (usernameError) errors.push(usernameError);

  const passwordError = validateRequired(userData.password, "Password");
  if (passwordError) errors.push(passwordError);

  return errors;
}

export function validateGameLibraryEntry(entryData) {
  const errors = [];

  if (!entryData.game_id) {
    errors.push("Game ID is required");
  }

  if (
    entryData.status &&
    !["playing", "completed", "want_to_play", "dropped"].includes(
      entryData.status,
    )
  ) {
    errors.push(
      "Invalid status. Must be one of: playing, completed, want_to_play, dropped",
    );
  }

  if (entryData.rating !== undefined && entryData.rating !== null) {
    const rating = parseFloat(entryData.rating);
    if (isNaN(rating) || rating < 0 || rating > 10) {
      errors.push("Rating must be between 0 and 10");
    }
  }

  if (
    entryData.play_time_hours !== undefined &&
    entryData.play_time_hours !== null
  ) {
    const playTime = parseInt(entryData.play_time_hours);
    if (isNaN(playTime) || playTime < 0) {
      errors.push("Play time must be a non-negative number");
    }
  }

  return errors;
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

export function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
}

export function validatePagination(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Max 100 items per page
    offset: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  };
}
