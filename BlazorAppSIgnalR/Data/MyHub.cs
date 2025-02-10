using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text.Json;

namespace BlazorAppSIgnalR.Data
{
    public class MyHub : Hub
    {
        public static ConcurrentDictionary<string, List<string>> ConnectedClients = new ConcurrentDictionary<string, List<string>>();

        public override Task OnConnectedAsync()
        {
            Groups.AddToGroupAsync(Context.ConnectionId, Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public async Task JoinGroup(object clientInfoJson)
        {
            var clientInfoString = clientInfoJson.ToString();
            if (clientInfoString == null)
            {
                throw new ArgumentNullException(nameof(clientInfoString));
            }

            ConnectedClients.AddOrUpdate(Context.ConnectionId,
                new List<string> { clientInfoString },
                (key, existingList) =>
                {
                    existingList.Add(clientInfoString);
                    return existingList;
                });

            await Task.CompletedTask;
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            ConnectedClients.TryRemove(Context.ConnectionId, out _);
            return base.OnDisconnectedAsync(exception);
        }

        // Optional: Example for clients calling the server
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}