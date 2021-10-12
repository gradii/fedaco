import { __awaiter } from 'tslib';
import { SqliteWrappedStmt } from './sqlite-wrapped-stmt';

export class SqliteWrappedConnection {
  constructor(driver) {
    this.driver = driver;
  }

  execute(sql, bindings) {
    return new Promise((resolve, reject) => {
      const stmt = this.driver.run(sql, bindings, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  prepare(sql) {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => {
        const stmt = this.driver.prepare(sql, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(new SqliteWrappedStmt(stmt));
        });
      });

    });
  }


  lastInsertId() {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise((ok, fail) => {
        this.driver.get('select last_insert_rowid()', (err, data) => {
          if (err) {
            fail(err);
          } else {
            ok(data && data['last_insert_rowid()']);
          }
        });
      });
    });
  }
}
