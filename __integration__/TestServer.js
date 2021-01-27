/* eslint-disable import/no-extraneous-dependencies */

jest.unmock('express');
jest.unmock('cookie-parser');

const express = require('express');
const cookieParser = require('cookie-parser');

const getJsonResponse = require('./responses/get-json.json');

class TestServer {
  start(port) {
    return new Promise((resolve, reject) => {
      try {
        this.stop();

        this.app = express();
        this.app.use(cookieParser());
        this.app.use(express.json());

        this.app.get('/get-html', (req, res) => {
          res.sendFile('responses/get-html.html', { root: __dirname });
        });

        this.app.get('/get-json', (req, res) => {
          res.json(getJsonResponse);
        });

        this.app.get('/get-file', (req, res) => {
          res.sendFile('responses/get-file.css', { root: __dirname });
        });

        this.app.post('/post-empty', (req, res) => {
          res.sendStatus(req.body.requestData?.isValid ? 200 : 400);
        });

        this.server = this.app.listen(port, () => {
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = TestServer;
