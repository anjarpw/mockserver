# Node.js Mock Server

This project provides a mock server where you can dynamically register and configure endpoints that respond with predefined behaviors. You can simulate multiple responses with different delays, HTTP status codes, and body content.

## Features

-   Register custom endpoints on the server.
-   Configure responses with specific HTTP codes, delays, and body content.
-   Simulate different response scenarios in sequence.
-   Flexible control of endpoint behavior after all responses have been executed.

## Start Debugging

1.  Clone the repository:    
      `git clone <repository-url>` 
  
2.  Install the dependencies:
    `npm install` 
    
3.  Start the server:
    `npm run dev` 


## Run The Docker
1.  Build:    
      `docker-compose build` 
  
2.  Run
    `docker-compose up` 

    

## How to Use

### Registering an Endpoint

You can register an endpoint by sending a `GET` request to the `/admin/<your_endpoint_key>` path on the server. The request body should include the configuration for the endpoint you want to create.

Example request:

`POST <HOST>/admin/<endpoint_keyname>` 

```
{
    "method": "POST",
    "path": <custom_path>,
    "whenCompleted": "backToFirst",
    "returns": [
        { 
            "code": 200,
            "delay": 1000,
            "body": {
                "message": "First response"
            }
        },
        { 
            "code": 400,
            "delay": 5000,
            "body": null
        }
    ]
}
```
 

### Parameters

-   `method`: HTTP method (e.g., `POST`, `GET`, etc.) that the endpoint will use.
-   `path`: The custom path for the endpoint (e.g., `/custom_endpoint`, it would be available with full path <HOST>/mock/custom_endpoint).
-   `whenCompleted`: Determines the behavior after the final response in the sequence:
    -   `"backToFirst"`: Resets the sequence and returns to the first response after all configured responses are executed.
    -   `"useLastResponse"`: Continues using the last response configuration indefinitely, without resetting to the first.
-   `returns`: An array of objects specifying the behavior of the endpoint:
    -   `code`: The HTTP status code to return (e.g., `200`, `400`, etc.).
    -   `delay`: The delay (in milliseconds) before sending the response.
    -   `body`: The JSON body to return in the response (can be `null` for no body).

### Accessing the Registered Endpoint

Once registered, your endpoint will be available at:

`<HOST>/mock/<custom_path>` 

You can send requests to this path, and the server will respond based on the configuration provided.


### Admin Operations

- **Reset Endpoint History**
	`POST /admin/reset/<endpoint_keyname>` 

     This will reset all historical records and counters for the specified endpoint, particularly useful if the endpoint returns various responses based on the `returns` property.

- **Delete Endpoint**
    
    
    `DELETE /admin/remove/<endpoint_keyname>` 
    
    This will delete the specified dynamic endpoint.
    
    
    This will delete all dynamic endpoints that have been registered on the server.
    
-   **Get Endpoint Details**
    
    `GET /admin/<endpoint_keyname>` 
    
    This will return the details of the specified dynamic endpoint, including the history of all requests made to it.


### Overall Administrative    

- **Delete All Endpoints**
    
    `DELETE /admin/all` 


-   **List All Endpoints**
    
    
    `GET /admin/list` 
    
    This will return a list of all dynamic endpoints that have been registered on the server.

    
## License

This project is licensed under the MIT License.
