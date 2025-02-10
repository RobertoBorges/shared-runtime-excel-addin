using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BlazorAppSIgnalR.Data
{
    public class BroadcastService : BackgroundService
    {
        private readonly IHubContext<MyHub> _hubContext;
        private readonly ILogger<BroadcastService> _logger;

        public BroadcastService(IHubContext<MyHub> hubContext, ILogger<BroadcastService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Broadcasting to clients...");

                foreach (var client in MyHub.ConnectedClients)
                {
                    foreach (var channel in client.Value)
                    {
                        // Send a message to each subscribed channel of each connected client
                        await _hubContext.Clients.Group(client.Key).SendAsync(
                            "ReceiveMessage",
                            new
                            {
                                Channel = channel,    // Or "Employee42", "StockTickerAAPL", etc.
                                Value = $"Invoquer: {client.Key}, Subscription: {channel} Server time: {DateTime.Now:hh:mm:ss tt}"
                            },
                            $"Server time: {DateTime.Now:hh:mm:ss tt}"
                        );
                    }
                }

                // Wait 10 seconds
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }
    }
}