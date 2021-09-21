const knex = require("../db/connection");

function list(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date })
    .orderBy("reservation_time", "asc");
}

function search(mobile_number) {
  return knex("reservations")
    // .whereRaw(
    //   "translate(mobile_number, '() -', '') like ?",
    //   `%${mobile_number.replace(/\D/g, "")}%`
    // )
    .where({ mobile_number })
    .orderBy("reservation_date");
}

function create(newReservation) {
  return knex("reservations")
    .insert(newReservation)
    .returning("*")
    .then((createdReservations) => createdReservations[0]);
}

function read(reservation_id) {
  return knex("reservations").where({ reservation_id }).first();
}

function update(reservation_id, data) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .update(data, "*")
    .then((updatedReservations) => updatedReservations[0]);
}

module.exports = {
  list,
  create,
  read,
  update,
  search,
};
