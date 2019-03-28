## File downloader (client.js)

The example shows how to download binary files from a specified server. The client creates a file, and saves the downloaded content by chunks to chunks. In this case the runtime memory consumption can be reduced.


## File downloader using pipe

The example shows how to download binary files from a specified server and save it in a specified file by using `pipe()`.


## File server (server.js)

The example shows how to send binary files to the connected clients. When a request happens, the server reads the file by 1024 byte blocks. These chunks are sent to the client. The chunks helps to reduce the runtime memory consumption.


## File server using pipe (server_with_pipe.js)

The example shows how to send binary files to the connected clients by using `pipe()`.
