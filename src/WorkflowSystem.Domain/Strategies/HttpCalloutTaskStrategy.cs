using System.Text.Json;
using WorkflowSystem.Domain.Entities;
using TaskEntity = WorkflowSystem.Domain.Entities.Task;

namespace WorkflowSystem.Domain.Strategies;

public class HttpCalloutTaskStrategy : ITaskStrategy
{
    public string TaskType => "HttpCallout";
    public string DisplayName => "HTTP Callout";
    public string Description => "Make HTTP requests to external APIs";
    public string Icon => "http";
    public bool IsConfigurable => true;

    public async System.Threading.Tasks.Task<ExecutionStep> ExecuteAsync(TaskEntity task, ExecutionStep step, object? inputData, CancellationToken cancellationToken = default)
    {
        try
        {
            step.Start();
            
            var config = task.GetConfiguration<HttpCalloutConfiguration>();
            var httpClient = new HttpClient();
            
            // Set headers
            if (config.Headers != null)
            {
                foreach (var header in config.Headers)
                {
                    httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
                }
            }

            // Set authentication
            if (!string.IsNullOrEmpty(config.Authentication?.Type))
            {
                switch (config.Authentication.Type.ToLower())
                {
                    case "basic":
                        var credentials = Convert.ToBase64String(
                            System.Text.Encoding.ASCII.GetBytes($"{config.Authentication.Username}:{config.Authentication.Password}"));
                        httpClient.DefaultRequestHeaders.Authorization = 
                            new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
                        break;
                    case "bearer":
                        httpClient.DefaultRequestHeaders.Authorization = 
                            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", config.Authentication.Token);
                        break;
                    case "apikey":
                        httpClient.DefaultRequestHeaders.Add(config.Authentication.HeaderName ?? "X-API-Key", config.Authentication.Token);
                        break;
                }
            }

            // Set timeout
            httpClient.Timeout = TimeSpan.FromSeconds(config.TimeoutSeconds ?? 30);

            // Prepare request
            var requestMessage = new HttpRequestMessage();
            requestMessage.Method = new HttpMethod(config.Method ?? "GET");
            requestMessage.RequestUri = new Uri(config.Url);

            if (!string.IsNullOrEmpty(config.Body) && config.Method?.ToUpper() != "GET")
            {
                requestMessage.Content = new StringContent(config.Body, System.Text.Encoding.UTF8, config.ContentType ?? "application/json");
            }

            // Execute request
            var response = await httpClient.SendAsync(requestMessage, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            // Parse response based on content type
            object? parsedResponse = null;
            if (response.Content.Headers.ContentType?.MediaType?.Contains("json") == true)
            {
                try
                {
                    parsedResponse = JsonSerializer.Deserialize<object>(responseContent);
                }
                catch
                {
                    parsedResponse = responseContent;
                }
            }
            else
            {
                parsedResponse = responseContent;
            }

            step.SetOutputData(new
            {
                StatusCode = (int)response.StatusCode,
                IsSuccess = response.IsSuccessStatusCode,
                Content = parsedResponse,
                Headers = response.Headers.ToDictionary(h => h.Key, h => h.Value.FirstOrDefault())
            });

            step.Complete();
            return step;
        }
        catch (Exception ex)
        {
            step.Fail(ex.Message);
            return step;
        }
    }

    public object GetDefaultConfiguration()
    {
        return new HttpCalloutConfiguration
        {
            Method = "GET",
            Url = "https://api.example.com/endpoint",
            TimeoutSeconds = 30,
            ContentType = "application/json",
            Headers = new Dictionary<string, string>(),
            Authentication = new HttpAuthentication { Type = "none" },
            UserDescription = string.Empty
        };
    }

    public bool ValidateConfiguration(string configuration)
    {
        try
        {
            var config = JsonSerializer.Deserialize<HttpCalloutConfiguration>(configuration);
            return config != null &&
                   !string.IsNullOrWhiteSpace(config.Url) &&
                   Uri.IsWellFormedUriString(config.Url, UriKind.Absolute);
        }
        catch
        {
            return false;
        }
    }

    public string GetConfigurationSchema()
    {
        var schema = new Dictionary<string, object>
        {
            ["type"] = "object",
            ["properties"] = new Dictionary<string, object>
            {
                ["method"] = new Dictionary<string, object>
                {
                    ["type"] = "string",
                    ["enum"] = new[] { "GET", "POST", "PUT", "DELETE", "PATCH" }
                },
                ["url"] = new Dictionary<string, object>
                {
                    ["type"] = "string",
                    ["format"] = "uri"
                },
                ["timeoutSeconds"] = new Dictionary<string, object>
                {
                    ["type"] = "integer",
                    ["minimum"] = 1,
                    ["maximum"] = 300
                },
                ["contentType"] = new Dictionary<string, object>
                {
                    ["type"] = "string"
                },
                ["body"] = new Dictionary<string, object>
                {
                    ["type"] = "string"
                },
                ["headers"] = new Dictionary<string, object>
                {
                    ["type"] = "object"
                },
                ["authentication"] = new Dictionary<string, object>
                {
                    ["type"] = "object",
                    ["properties"] = new Dictionary<string, object>
                    {
                        ["type"] = new Dictionary<string, object>
                        {
                            ["type"] = "string",
                            ["enum"] = new[] { "none", "basic", "bearer", "apikey" }
                        },
                        ["username"] = new Dictionary<string, object>
                        {
                            ["type"] = "string"
                        },
                        ["password"] = new Dictionary<string, object>
                        {
                            ["type"] = "string"
                        },
                        ["token"] = new Dictionary<string, object>
                        {
                            ["type"] = "string"
                        },
                        ["headerName"] = new Dictionary<string, object>
                        {
                            ["type"] = "string"
                        }
                    }
                },
                ["userDescription"] = new Dictionary<string, object>
                {
                    ["type"] = "string"
                }
            },
            ["required"] = new[] { "url" }
        };

        return JsonSerializer.Serialize(schema);
    }
}

public class HttpCalloutConfiguration
{
    public string Method { get; set; } = "GET";
    public string Url { get; set; } = string.Empty;
    public int? TimeoutSeconds { get; set; } = 30;
    public string? ContentType { get; set; }
    public string? Body { get; set; }
    public Dictionary<string, string>? Headers { get; set; }
    public HttpAuthentication? Authentication { get; set; }
    public string? UserDescription { get; set; }
}

public class HttpAuthentication
{
    public string Type { get; set; } = "none";
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? Token { get; set; }
    public string? HeaderName { get; set; }
} 