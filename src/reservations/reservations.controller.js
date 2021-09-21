/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const tablesService = require("../tables/tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function asDateString(date) {
  return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundReservation = await service.read(Number(reservation_id));
  res.locals.foundReservation = foundReservation;
  if (!foundReservation) {
    return next({
      status: 404,
      message: `${reservation_id} not found.`,
    });
  }
  return next();
}

function hasData(req, res, next) {
  if (!req.body.data) {
    return next({
      status: 400,
      message: "Data required.",
    });
  }
  return next();
}

function hasValidFirstName(req, res, next) {
  if (!req.body.data.first_name) {
    return next({
      status: 400,
      message: "First name required.",
    });
  }
  return next();
}

function hasValidLastName(req, res, next) {
  if (!req.body.data.last_name) {
    return next({
      status: 400,
      message: "Last name required.",
    });
  }
  return next();
}

function hasValidMobileNumber(req, res, next) {
  if (!req.body.data.mobile_number) {
    return next({
      status: 400,
      message: "Mobile number required.",
    });
  }
  return next();
}

function hasValidReservationDate(req, res, next) {
  if (
    !req.body.data.reservation_date ||
    !req.body.data.reservation_date.match(/\d\d\d\d-\d\d-\d\d/)
  ) {
    return next({
      status: 400,
      message: "Reservation date required.",
    });
  }
  return next();
}

function hasValidReservationTime(req, res, next) {
  if (
    !req.body.data.reservation_time ||
    !req.body.data.reservation_time.match(/\d\d:\d\d/)
  ) {
    return next({
      status: 400,
      message: "Reservation time required.",
    });
  }
  return next();
}

function hasValidPeople(req, res, next) {
  if (!req.body.data.people || typeof req.body.data.people !== "number") {
    return next({
      status: 400,
      message: "People must be a valid number.",
    });
  }
  return next();
}

function isNotTuesday(req, res, next) {
  const parts = req.body.data.reservation_date.split("-");
  const dateObject = new Date(parts[0], parts[1] - 1, parts[2]);
  if (dateObject.getDay() === 2) {
    return next({
      status: 400,
      message: "We are closed on Tuesdays.",
    });
  }
  return next();
}

function isNotEarlierToday(req, res, next) {
  //TODO reformat this
  const { reservation_time, reservation_date } = req.body.data;
  const today = new Date();
  const todayStart = new Date(asDateString(today));
  const resDate = new Date(reservation_date);
  const currentTime = Number(
    `${today.getHours()}${
      today.getMinutes() < 10 ? "0" : "" + today.getMinutes()
    }`
  );
  const resTime = Number(reservation_time.replace(":", ""));
  if (
    asDateString(todayStart) == asDateString(resDate) &&
    resTime < currentTime
  ) {
    return next({
      status: 400,
      message: "Reservation must be later this evening.",
    });
  }
  return next();
}

function isNotPastDate(req, res, next) {
  //TODO reformat this
  const { reservation_date } = req.body.data;
  const today = new Date();
  const todayStart = new Date(asDateString(today));
  const resDate = new Date(reservation_date);
  if (resDate < todayStart) {
    return next({
      status: 400,
      message: "Reservation must be in the future.",
    });
  }
  return next();
}

function isWithinHours(req, res, next) {
  if (
    Number(req.body.data.reservation_time.replace(":", "")) < 1030 ||
    Number(req.body.data.reservation_time.replace(":", "")) > 2130
  ) {
    return next({
      status: 400,
      message: "Reservation must be between 10:30AM and 9:30PM",
    });
  }
  return next();
}

function isNotSeated(req, res, next) {
  const { status } = req.body.data;
  if (status == "seated") {
    return next({
      status: 400,
      message: "Reservation cannot have a status of 'seated'",
    });
  }
  return next();
}

function isNotFinished(req, res, next) {
  const { status } = req.body.data;
  if (status == "finished") {
    return next({
      status: 400,
      message: "Reservation cannot have a status of 'finished'",
    });
  }
  return next();
}

function isNotAlreadyCompleted(req, res, next) {
  const { status } = res.locals.foundReservation;
  if (status == "finished") {
    return next({
      status: 400,
      message: "Finished reservations cannot be updated",
    });
  }
  return next();
}

async function list(req, res) {
  let data;
  if (req.query.date) {
    data = await service.list(req.query.date);
  } else if (req.query.mobile_number) {
    data = await service.search(req.query.mobile_number);
  }
  res.json({ data });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function read(req, res) {
  const { reservation_id } = req.params;
  const data = await service.read(Number(reservation_id));
  res.status(200).json({ data });
}

async function update(req, res) {
  const { reservation_id } = req.params;
  const data = await service.update(reservation_id, req.body.data);
  res.status(200).json({ data });
}

async function readTable(req, res) {
  const { reservation_id } = req.params;
  const data = await tablesService.readByReservation(reservation_id);
  res.status(200).json({ data });
}

module.exports = {
  list,
  create: [
    hasData,
    hasValidFirstName,
    hasValidLastName,
    hasValidMobileNumber,
    hasValidReservationDate,
    hasValidReservationTime,
    hasValidPeople,
    isNotTuesday,
    isNotEarlierToday,
    isNotPastDate,
    isWithinHours,
    isNotSeated,
    isNotFinished,
    asyncErrorBoundary(create),
  ],
  read: [reservationExists, asyncErrorBoundary(read)],
  update: [
    reservationExists,
    hasValidFirstName,
    hasValidLastName,
    hasValidMobileNumber,
    hasValidReservationDate,
    hasValidReservationTime,
    hasValidPeople,
    isNotTuesday,
    isNotEarlierToday,
    isNotPastDate,
    isWithinHours,
    isNotSeated,
    isNotAlreadyCompleted,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    reservationExists,
    asyncErrorBoundary(update),
  ],
  readTable: [reservationExists, asyncErrorBoundary(readTable)],
};
