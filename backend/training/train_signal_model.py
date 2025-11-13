import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
import joblib

# ======= LOAD DATA =======
df = pd.read_csv("./traffic_history.csv")

# Select relevant columns
data = df[['NS_density', 'EW_density', 'hour', 'weekday']].values

# ======= SCALE DATA =======
scaler = MinMaxScaler()
data = scaler.fit_transform(data)

# Input features (all except last row)
X = torch.tensor(data[:-1], dtype=torch.float32)
# Targets: predict next NS & EW densities
y = torch.tensor(data[1:, 0:2], dtype=torch.float32)

# ======= DEFINE MODEL =======
class TrafficLSTM(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(input_size=4, hidden_size=64, batch_first=True)
        self.fc = nn.Linear(64, 2)  # output both NS and EW

    def forward(self, x):
        x = x.unsqueeze(1)  # (batch, time=1, features)
        lstm_out, _ = self.lstm(x)
        out = self.fc(lstm_out[:, -1])
        return out

model = TrafficLSTM()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn = nn.MSELoss()

# ======= TRAIN LOOP =======
for epoch in range(300):
    optimizer.zero_grad()
    pred = model(X)
    loss = loss_fn(pred, y)
    loss.backward()
    optimizer.step()
    if epoch % 10 == 0:
        print(f"Epoch {epoch:03d} | Loss: {loss.item():.6f}")

# ======= SAVE MODEL & SCALER =======
torch.save(model.state_dict(), "signal_model.pt")
joblib.dump(scaler, "signal_scaler.gz")

print("✅ Model + scaler saved successfully!")
