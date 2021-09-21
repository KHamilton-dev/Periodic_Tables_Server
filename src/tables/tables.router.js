const controller = require("./tables.controller");
const router = require("express").Router();

router.route("/")
.get(controller.list)
.post(controller.create);

router.route("/:table_id/seat")
.put(controller.update)
.delete(controller.destroy);

module.exports = router;