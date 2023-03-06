import { serve } from "https://deno.land/std/http/server.ts";
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";

console.log("Listening on http://localhost:8000");

serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  if (req.method === "POST" && pathname === "/convert") {
    const requestJson = await req.json();
    const csvData = requestJson.data;
    const sqlQuery = await convertCsvToSql(csvData as string);
    return new Response(sqlQuery)
  } 

  if(req.method === "GET" && pathname === "/"){
    return serveDir(req, {
        fsRoot: "public",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
      });
  }

  return new Response('Invalid request' ,{status:404});
});


function convertCsvToSql(csvData: string): string {
  const rows = csvData.trim().split("\n");
  const table_name = rows.shift()!.split(",");
  const headers = rows.shift()!.split(",");
  // console.log(table_name)
  // console.log(headers)
  // console.log(rows)
  const sqlRows = rows.map((row) =>
    `(${row.split(",").map((value) => `'${value}'`).join(",")})`
  );
  const sqlQuery = `INSERT INTO "${table_name}" (${
    headers.map((header) => `'${header}'`).join(",")
  }) VALUES\n${sqlRows.join(",\n")};`;
  return sqlQuery;
}
