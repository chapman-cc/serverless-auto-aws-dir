# Serverless AWS dependency auto wrapper

If you are wokring on lambda layers, the dependencies are zipped in `./nodejs/node_modules` or `./python/lib` rather than your usual spot
this plugin detects if you have these dependencies directory, then make a symbolic link in the aws layer specific dir, 
and will incclude that directory in the zip archive. 

it currently supports **Node JS** and **Python** 