import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { AuthContext } from "../context/context";
import { API_PATHS } from "../utils/apiPath";

const statusStyles = {
  fresh: "bg-green-700",
  "expiring-soon": "bg-yellow-500 text-black",
  expired: "bg-red-700",
};

const statusLabels = {
  fresh: "Fresh",
  "expiring-soon": "Expiring Soon",
  expired: "Expired",
};

const categories = ["all", "produce", "dairy", "meat", "pantry", "frozen", "other"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("expiryDate");
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, expiringRes, itemsRes] = await Promise.all([
          axios.get(API_PATHS.DASHBOARD.WASTE, authHeader),
          axios.get(API_PATHS.DASHBOARD.EXPIRING, authHeader),
          axios.get(API_PATHS.ITEM.GET, authHeader),
        ]);
        setStats(statsRes.data);
        setExpiringItems(expiringRes.data.items || []);
        setItems(itemsRes.data.items || []);
      } catch (err) {
        if (err.response?.status === 400) {
          toast.error("Create or join a household first");
          navigate("/");
          return;
        }
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, navigate, authHeader]);

  const visibleItems = useMemo(() => {
    const filteredItems =
      category === "all"
        ? items
        : items.filter((item) => item.category === category);

    return [...filteredItems].sort((a, b) => {
      if (sortBy === "category") {
        return a.category.localeCompare(b.category);
      }
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  }, [items, category, sortBy]);

  const contributors = useMemo(() => {
    const contributorMap = {};
    for (const item of items) {
      const id = item.addedBy?._id || "unknown";
      const name = item.addedBy?.name || "Unknown";
      if (!contributorMap[id]) {
        contributorMap[id] = { id, name, total: 0, used: 0, wasted: 0 };
      }
      contributorMap[id].total += 1;
      if (item.status === "used") contributorMap[id].used += 1;
      if (item.status === "wasted") contributorMap[id].wasted += 1;
    }
    return Object.values(contributorMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [items]);

  const renderShelf = (status) => {
    const shelfItems = visibleItems.filter((item) => item.status === status);

    return (
      <div className="rounded-lg border-2 border-black overflow-hidden">
        <div className={`${statusStyles[status]} p-3 text-white flex items-center justify-between`}>
          <h2 className="text-lg font-semibold">{statusLabels[status]}</h2>
          <span className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-black">
            {stats?.countsByStatus?.[status] || 0}
          </span>
        </div>
        <div className="min-h-48 bg-white p-3 space-y-3">
          {shelfItems.length > 0 ? (
            shelfItems.map((item) => (
              <div key={item._id} className="rounded-lg border-2 border-black p-3">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-slate-700">{item.category} • Qty {item.quantity}</p>
                <p className="text-sm text-slate-700">
                  Use by: {new Date(item.expiryDate).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No items here.</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen w-screen p-4 space-y-5">
      <div className="rounded-lg border-2 border-black bg-blue-950 p-4 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-200">Household inventory, expiry alerts, and waste tracking</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate("/add")}>Add Item</Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/items")}>All Items</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border-2 border-black p-4">
          <h2 className="text-sm font-medium text-slate-600">Total Items</h2>
          <p className="text-3xl font-bold">{stats?.totalItems || 0}</p>
        </div>
        <div className="rounded-lg border-2 border-black p-4">
          <h2 className="text-sm font-medium text-slate-600">Waste Score</h2>
          <p className="text-3xl font-bold">{stats?.wasteScore || 0}%</p>
        </div>
        <div className="rounded-lg border-2 border-black p-4">
          <h2 className="text-sm font-medium text-slate-600">Used</h2>
          <p className="text-3xl font-bold">{stats?.countsByStatus?.used || 0}</p>
        </div>
        <div className="rounded-lg border-2 border-black p-4">
          <h2 className="text-sm font-medium text-slate-600">Wasted</h2>
          <p className="text-3xl font-bold">{stats?.countsByStatus?.wasted || 0}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-black p-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-semibold">Shelf Display</h2>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Category</label>
              <select className="rounded-lg border-2 border-black p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((currentCategory) => (
                  <option key={currentCategory} value={currentCategory}>{currentCategory}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">Sort By</label>
              <select className="rounded-lg border-2 border-black p-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="expiryDate">Expiry Date</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {renderShelf("fresh")}
          {renderShelf("expiring-soon")}
          {renderShelf("expired")}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border-2 border-black p-4">
          <h2 className="text-2xl font-semibold">Expiring Within 24 Hours</h2>
          <div className="mt-3 space-y-3">
            {expiringItems.length > 0 ? expiringItems.map((item) => (
              <div key={item._id} className="rounded-lg bg-yellow-100 border-2 border-yellow-500 p-3">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm">Use by: {new Date(item.expiryDate).toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No urgent expiry alerts.</p>}
          </div>
        </div>

        <div className="rounded-lg border-2 border-black p-4">
          <h2 className="text-2xl font-semibold">Top Contributors</h2>
          <div className="mt-3 space-y-3">
            {contributors.length > 0 ? contributors.map((contributor, index) => (
              <div key={contributor.id} className="rounded-lg border-2 border-black p-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{index + 1}. {contributor.name}</h3>
                  <p className="text-sm text-slate-600">Used {contributor.used} • Wasted {contributor.wasted}</p>
                </div>
                <span className="rounded-lg bg-blue-950 px-3 py-1 text-white">{contributor.total}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No contributors yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
