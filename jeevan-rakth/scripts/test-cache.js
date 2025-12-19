import http from "http";
const url = "http://127.0.0.1:3000/api/users?page=1&limit=1";

function doRequest(cb) {
  const start = Date.now();
  http
    .get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        const ms = Date.now() - start;
        cb(null, {
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          ms,
        });
      });
    })
    .on("error", (e) => cb(e));
}

(async () => {
  console.log("Test 1: Cold request (expect MISS)");
  await new Promise((r) =>
    doRequest((err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log("status", res.statusCode);
        console.log("x-cache", res.headers["x-cache"]);
        console.log("time", res.ms + "ms");
      }
      r();
    })
  );

  // Small delay
  await new Promise((r) => setTimeout(r, 500));

  console.log("\nTest 2: Warm request (expect HIT)");
  await new Promise((r) =>
    doRequest((err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log("status", res.statusCode);
        console.log("x-cache", res.headers["x-cache"]);
        console.log("time", res.ms + "ms");
      }
      r();
    })
  );

  console.log("\nDone.");
})();
