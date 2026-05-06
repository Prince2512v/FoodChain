import streamlit as st
import pandas as pd
import datetime
import hashlib
import time

# ── PAGE CONFIG ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Quantum FoodChain | Network Node",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── SESSION STATE INITIALIZATION ─────────────────────────────────────────────
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user_role' not in st.session_state:
    st.session_state.user_role = None
if 'page' not in st.session_state:
    st.session_state.page = "Login"
if 'db' not in st.session_state:
    # Initial seed data
    st.session_state.db = pd.DataFrame([
        {'BatchId': 'WHT-1024', 'ProductName': 'Organic Wheat', 'Status': 'Created', 'Quantity': 500, 'Role': 'Farmer', 'Timestamp': str(datetime.datetime.now())},
        {'BatchId': 'RCE-2056', 'ProductName': 'Premium Rice', 'Status': 'Processing', 'Quantity': 1200, 'Role': 'Processor', 'Timestamp': str(datetime.datetime.now())}
    ])

# ── CUSTOM STYLING ───────────────────────────────────────────────────────────
st.markdown("""
<style>
    .stApp { background-color: #f8fafc; }
    .main-card {
        background-color: white;
        padding: 30px;
        border-radius: 24px;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05);
        border: 1px solid #f1f5f9;
        margin-bottom: 20px;
    }
    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    .badge-farmer { background-color: #ecfdf5; color: #059669; }
    .badge-processor { background-color: #eff6ff; color: #2563eb; }
    .badge-distributor { background-color: #fff7ed; color: #ea580c; }
</style>
""", unsafe_allow_html=True)

# ── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
def generate_tx_hash(data):
    return hashlib.sha256(str(data).encode()).hexdigest()

def logout():
    st.session_state.authenticated = False
    st.session_state.user_role = None
    st.session_state.page = "Login"
    st.rerun()

# ── LOGIN PAGE ───────────────────────────────────────────────────────────────
def show_login():
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("<div style='text-align: center; margin-top: 100px;'>", unsafe_allow_html=True)
        st.image("https://cdn-icons-png.flaticon.com/512/2321/2321769.png", width=80)
        st.title("Quantum FoodChain")
        st.caption("IDENTITY PORTAL | BLOCKCHAIN CORE")
        
        with st.container(border=True):
            email = st.text_input("Network Credential (Email)")
            password = st.text_input("Access Key", type="password")
            
            if st.button("Initialize Authentication", use_container_width=True, type="primary"):
                if email == "admin@demo.com" and password == "123456":
                    st.session_state.authenticated = True
                    st.session_state.user_role = "Admin"
                    st.success("Governance Node Authorized")
                    time.sleep(1)
                    st.rerun()
                elif email == "farmer@demo.com" and password == "123456":
                    st.session_state.authenticated = True
                    st.session_state.user_role = "Farmer"
                    st.success("Agricultural Node Authorized")
                    time.sleep(1)
                    st.rerun()
                else:
                    st.error("Invalid credentials. Try admin@demo.com / 123456")
            
            st.markdown("---")
            if st.button("New to the network? Provision Account"):
                st.session_state.page = "Register"
                st.rerun()

# ── REGISTRATION PAGE ────────────────────────────────────────────────────────
def show_register():
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("<div style='text-align: center; margin-top: 80px;'>", unsafe_allow_html=True)
        st.title("Provision Node")
        st.caption("JOIN THE DECENTRALIZED PROTOCOL")
        
        with st.container(border=True):
            name = st.text_input("Legal Entity Name")
            role = st.selectbox("Protocol Role", ["Farmer", "Processor", "Distributor", "Retailer"])
            email = st.text_input("Email Address")
            st.text_input("Create Access Key", type="password")
            
            if st.button("Register Node", use_container_width=True, type="primary"):
                st.balloons()
                st.success(f"Node '{name}' provisioned as {role}. Redirecting to login...")
                time.sleep(2)
                st.session_state.page = "Login"
                st.rerun()
            
            if st.button("Already a participant? Sign In"):
                st.session_state.page = "Login"
                st.rerun()

# ── DASHBOARD (AFTER LOGIN) ──────────────────────────────────────────────────
def show_dashboard():
    # Sidebar
    with st.sidebar:
        st.image("https://cdn-icons-png.flaticon.com/512/2321/2321769.png", width=60)
        st.title("Network Status")
        st.info(f"Connected as: **{st.session_state.user_role}**")
        st.markdown("---")
        
        menu = ["Overview", "Management", "Audit Trail"]
        if st.session_state.user_role == "Farmer":
            menu.append("Add Harvest")
        elif st.session_state.user_role == "Admin":
            menu.append("Governance")
            
        choice = st.radio("Navigation", menu)
        
        st.markdown("---")
        if st.button("🔒 Terminate Session", use_container_width=True):
            logout()

    # Main Content
    if choice == "Overview":
        st.title(f"🚀 {st.session_state.user_role} Intelligence Hub")
        
        m1, m2, m3 = st.columns(3)
        m1.metric("Total Volume", f"{st.session_state.db['Quantity'].sum()} kg")
        m2.metric("Active Batches", len(st.session_state.db))
        m3.metric("Trust Score", "99.8%")
        
        st.markdown("### Active Protocol Events")
        st.dataframe(st.session_state.db, use_container_width=True)

    elif choice == "Add Harvest" and st.session_state.user_role == "Farmer":
        st.title("🌾 Register New Harvest")
        with st.form("harvest_form"):
            p_name = st.text_input("Product Name")
            qty = st.number_input("Quantity (kg)", min_value=1)
            batch = f"BTCH-{int(time.time())}"
            submitted = st.form_submit_button("Sign & Commit to Chain")
            
            if submitted:
                new_row = {'BatchId': batch, 'ProductName': p_name, 'Status': 'Created', 'Quantity': qty, 'Role': 'Farmer', 'Timestamp': str(datetime.datetime.now())}
                st.session_state.db = pd.concat([st.session_state.db, pd.DataFrame([new_row])], ignore_index=True)
                st.success(f"Batch {batch} committed with hash: {generate_tx_hash(new_row)[:16]}...")
                st.balloons()

    elif choice == "Audit Trail":
        st.title("🛡️ Blockchain Ledger")
        for i, row in st.session_state.db.iterrows():
            with st.expander(f"BLOCK {i} | {row['BatchId']} - {row['Status']}"):
                st.write(f"**Action:** {row['Role']} Registration")
                st.write(f"**Data:** {row['ProductName']} ({row['Quantity']} kg)")
                st.code(f"TX_HASH: {generate_tx_hash(row)}", language="bash")
                st.markdown("✅ **Integrity Verified**")

# ── ROUTING ──────────────────────────────────────────────────────────────────
if not st.session_state.authenticated:
    if st.session_state.page == "Login":
        show_login()
    else:
        show_register()
else:
    show_dashboard()
