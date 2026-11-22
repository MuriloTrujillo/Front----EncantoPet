const API_URL = "http://localhost:3000";

export const createSchedule = async (data) => {
  let response = await fetch(`${API_URL}/api/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  response = await response.json()
  console.log("createSchedule", response );
  return response;
};

export const listScheduleDay = async (day) => {
  let response = await fetch(`${API_URL}/api/schedule/list-day/${day}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  response = await response.json()
  console.log("listScheduleDay", response );
  return response;
};

