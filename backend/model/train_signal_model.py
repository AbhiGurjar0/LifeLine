import pandas as pd
import torch
import os
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler

# Load data
df = pd.read_csv("./traffic_history.csv")

# Select useful columns
data = df[['density', 'hour', 'weekday']].values

# Scale data to 0–1
scaler = MinMaxScaler()
data = scaler.fit_transform(data)

# Convert to tensors
X = torch.tensor(data[:-1], dtype=torch.float32)
y = torch.tensor(data[1:, 0], dtype=torch.float32)  # predict next density only

# Define Model
class TrafficLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(input_size=3, hidden_size=32, batch_first=True)
        self.fc = nn.Linear(32, 1)

    def forward(self, x):
        x = x.unsqueeze(1)  # (batch, time=1, features)
        lstm_out, _ = self.lstm(x)
        out = self.fc(lstm_out[:, -1])
        return out.squeeze()

model = TrafficLSTM()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn = nn.MSELoss()

# Train
for epoch in range(200):
    optimizer.zero_grad()
    pred = model(X)
    loss = loss_fn(pred, y)
    loss.backward()
    optimizer.step()
    print(f"Epoch {epoch}  Loss: {loss.item():.6f}")

# Save model + scaler
torch.save(model.state_dict(), "signal_model.pt")
import joblib
joblib.dump(scaler, "signal_scaler.gz")

print("✅ Model + scaler saved!")
