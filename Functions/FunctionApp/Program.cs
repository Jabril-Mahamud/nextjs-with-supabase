using Azure.Storage.Blobs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();


        string apiKey = Environment.GetEnvironmentVariable("ElevenLabsApiKey");
        services.AddSingleton<ITtsService>(sp => new ElevenLabsTtsService(apiKey));

        services.AddSingleton<IQueueMessageProcessor, QueueMessageProcessor>();

        // Add Blob Storage client
        string storageConnectionString = Environment.GetEnvironmentVariable("ConnectionString");
        services.AddSingleton(x => new BlobServiceClient(storageConnectionString));

        // Register the new blob storage service
        services.AddSingleton<IBlobStorageService, AzureBlobStorageService>();

    })
    .Build();

host.Run();
