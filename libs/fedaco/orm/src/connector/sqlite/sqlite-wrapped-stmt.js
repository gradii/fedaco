import { __awaiter } from 'tslib';

export class SqliteWrappedStmt {
  constructor(driverStmt) {
    this.driverStmt = driverStmt;
    this._bindingValues = [];
  }

  bindValues(bindings) {
    this._bindingValues = bindings;
    return this;
  }

  execute(bindings) {
    return __awaiter(this, void 0, void 0, function* () {

      console.log(`run this ${this.driverStmt.sql}`, bindings !== null && bindings !== void 0 ? bindings : this._bindingValues);
      const _self = this;
      return new Promise((ok, fail) => {
        this.driverStmt
          .run(...(bindings !== null && bindings !== void 0 ? bindings : this._bindingValues), function(err) {
            if (err) {
              return fail(err);
            }
            _self._lastInsertId = this.lastID;
            _self._affectRows = this.changes;
          })
          .finalize((err) => {
            if (err) {
              return fail(err);
            }
            ok(true);
          });
      });
    });
  }

  fetchAll(bindings) {
    return __awaiter(this, void 0, void 0, function* () {

      console.log(`run this ${this.driverStmt.sql}`, bindings !== null && bindings !== void 0 ? bindings : this._bindingValues);
      return new Promise((ok, fail) => {
        this.driverStmt.all(bindings !== null && bindings !== void 0 ? bindings : this._bindingValues, function(err, rows) {
          if (err) {
            return fail(err);
          }
          ok(rows);
        });
        this.driverStmt.finalize((err) => {
        });
      });
    });
  }

  lastInsertId() {
    return this._lastInsertId;
  }

  affectCount() {


    return this._affectRows;
  }

  close() {

    this.driverStmt.reset();
    this.driverStmt.finalize();
  }

  bindValue() {
    return undefined;
  }
}
