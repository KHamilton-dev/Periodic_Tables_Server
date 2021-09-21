const service = require('./tables.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);

  if (table) {
    res.locals.table = table;
    return next();
  } else {
    return next({
      status: 404,
      message: `Table with id of ${table_id} does not exist.`
    })
  }
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await service.readReservationId(reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    next();
  } else {
    return next({
      status: 404,
      message: `Reservation with reservation id ${reservation_id} does not exist.`
    })
  }
}

function hasTableName(req, res, next) {
  const { table_name } = req.body.data;
  if (!table_name) {
    return next({
      status: 400,
      message: "Table name required"
    })
  }
  return next();
}

function hasCapacity(req, res, next) {
  const { capacity } = req.body.data;
  if (!capacity) {
    return next({
      status: 400,
      message: "Capacity required"
    })
  }
  return next();
}

function hasReservationId(req, res, next) {
  const { reservation_id } = req.body.data;
  if (!reservation_id) {
    return next({
      status: 400,
      message: "Reservation id required"
    })
  }
  return next();
}

function tableNameMoreThanOneChar(req, res, next) {
  const { table_name } = req.body.data;

  if (table_name.length > 1) next();
  else {
    return next({
      status: 400,
      message: "Table name must be more than one character"
    })
  }
}

function sufficientCapacity(req, res, next) {
  const table = res.locals.table;
  const reservation = res.locals.reservation;

  if (reservation.people <= table.capacity) next();
  else {
    return next({
      status: 400,
      message: `The table cannot fit that number of patrons`
    })
  }
}

function tableIsOccupied(req, res, next) {
  const table = res.locals.table;

  if (table.reservation_id) next();
  else {
    return next({
      status: 400,
      message: "This table is not occupied"
    })
  }
}

function tableIsNotOccupied(req, res, next) {
  const table = res.locals.table;

  if (!table.reservation_id) next();
  else {
    return next({
      status: 400,
      message: "This table is occupied"
    })
  }
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function read(_, res) {
  const { table_id } = res.locals.table;
  const data = await service.read(table_id);
  res.json({ data });
}

async function update(req, res) {
  const { table_id } = req.params;
  const data = await service.update(table_id, req.body.data);
  res.json({ data });
}

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function destroy(req, res) {
  const { table_id } = res.locals.table;
  const data = await service.destroy(table_id, req.body.data);
  res.json({ data });
}

module.exports = {
  create: [
    hasTableName,
    hasCapacity,
    tableNameMoreThanOneChar,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  update: [
    hasReservationId,
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reservationExists),
    sufficientCapacity,
    tableIsNotOccupied,
    asyncErrorBoundary(update),
  ],
  destroy: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(destroy),
  ],
  list: asyncErrorBoundary(list),
};