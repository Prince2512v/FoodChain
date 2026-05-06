import streamlit as st
import pandas as pd
import datetime
import time

# ── PAGE CONFIG ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Quantum FoodChain | Analytics Node",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── CUSTOM CSS ───────────────────────────────────────────────────────────────
st.markdown("""
<style>
    .main {
        background-color: #f8fafc;
    }
    .stMetric {
        background-color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        border: 1px solid #f1f5f9;
    }
    .stButton>button {
        border-radius: 10px;
        font-weight: bold;
        background-color: #10b981;
        color: white;
        border: none;
    }
    .stButton>button:hover {
        background-color: #059669;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

# ── SIDEBAR ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/2321/2321769.png", width=80)
    st.title("Quantum FoodChain")
    st.markdown("---")
    st.info("💡 **Tip:** Connect your Cloud SQL Server in the settings to see live production data.")
    
    st.subheader("Configuration")
    db_status = st.toggle("Simulate Real-Time Data", value=True)
    
    st.markdown("---")
    st.caption("v1.0.4-beta | Blockchain Node: Active")

# ── DATABASE CONNECTION ──────────────────────────────────────────────────────
def get_data():
    # In a real deployment, you would use:
    # conn = st.connection("sql")
    # return conn.query("SELECT * FROM Products")
    
    # Simulating data for demonstration
    data = {
        'BatchId': ['WHT-1024', 'RCE-2056', 'SOY-3091', 'CRN-4012', 'WHT-1025'],
        'ProductName': ['Organic Wheat', 'Premium Rice', 'Soybean', 'Sweet Corn', 'Durum Wheat'],
        'Status': ['Created', 'Processing', 'In Transit', 'Delivered', 'Created'],
        'Quantity': [500, 1200, 800, 2500, 450],
        'Timestamp': [datetime.datetime.now() - datetime.timedelta(days=i) for i in range(5)]
    }
    return pd.DataFrame(data)

# ── HEADER ───────────────────────────────────────────────────────────────────
st.title("🌾 Analytics Dashboard")
st.markdown("#### Real-time visibility into the decentralized supply chain network.")

# ── METRICS ──────────────────────────────────────────────────────────────────
df = get_data()
m1, m2, m3, m4 = st.columns(4)

with m1:
    st.metric("Total Yield", f"{df['Quantity'].sum()} kg", "+12%")
with m2:
    st.metric("Active Batches", len(df), "Steady")
with m3:
    st.metric("In Transit", len(df[df['Status'] == 'In Transit']), "-2")
with m4:
    st.metric("Quality Alerts", "0", "Critical", delta_color="inverse")

# ── MAIN CONTENT ─────────────────────────────────────────────────────────────
st.markdown("---")
col_left, col_right = st.columns([2, 1])

with col_left:
    st.subheader("📦 Inventory Pulse")
    st.dataframe(df, use_container_width=True, hide_index=True)
    
    st.subheader("📈 Throughput Trend")
    chart_data = df.copy()
    chart_data = chart_data.set_index('Timestamp')
    st.line_chart(chart_data['Quantity'], color="#10b981")

with col_right:
    st.subheader("🛡️ Blockchain Audit")
    for i, row in df.iterrows():
        with st.expander(f"Batch {row['BatchId']} - {row['Status']}"):
            st.write(f"**Product:** {row['ProductName']}")
            st.write(f"**Volume:** {row['Quantity']} kg")
            st.code("Tx: 0x72a...f4e", language="bash")
            st.button(f"Verify On-Chain", key=f"btn_{i}")

# ── FOOTER ───────────────────────────────────────────────────────────────────
st.markdown("---")
st.caption("© 2026 Quantum FoodChain Inc. Secure Traceability Powered by Ethereum.")
