import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_PATHS } from "../utils/apiPath";
import toast from "react-hot-toast";
import Button from "../components/Button";

export default function Items() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "produce",
    quantity: 1,
    expiryDate: "",
  });
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token],
  );

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(API_PATHS.ITEM.GET, authHeader);
      setItems(res.data.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  }, [authHeader]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const t = setTimeout(() => {
      fetchItems();
    });
    return () => clearTimeout(t);
  }, [token, navigate, fetchItems]);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      expiryDate: item.expiryDate?.slice(0, 10) || "",
    });
  };

  const updateItem = async (e, itemId) => {
    e.preventDefault();
    if (
      !editForm.name.trim() ||
      !editForm.category ||
      !editForm.quantity ||
      !editForm.expiryDate
    ) {
      toast.error("Missing required fields");
      return;
    }
    try {
      await axios.put(
        API_PATHS.ITEM.UPDATE(itemId),
        {
          ...editForm,
          quantity: Number(editForm.quantity),
        },
        authHeader,
      );
      toast.success("Item updated");
      setEditingId(null);
      await fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(API_PATHS.ITEM.DELETE(itemId), authHeader);
      toast.success("Item deleted");
      setItems((currentItems) =>
        currentItems.filter((item) => item._id !== itemId),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const markItem = async (itemId, status) => {
    try {
      await axios.patch(API_PATHS.ITEM.MARK(itemId), { status }, authHeader);
      toast.success(`Item marked as ${status}`);
      await fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center">
      <div className="flex w-full max-w-6xl justify-end gap-3 px-4">
        <Button type="button" variant="secondary" onClick={() => navigate("/")}>
          Household
        </Button>
        <Button type="button" onClick={() => navigate("/add")}>
          Add Item
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 border-2 mx-3 my-5 p-4 border-black rounded-lg bg-blue-800 text-white">
          {items.map((item) => (
            <div key={item._id} className="flex flex-col gap-2">
              {editingId === item._id ? (
                <form
                  onSubmit={(e) => updateItem(e, item._id)}
                  className="flex flex-col gap-2 text-gray-200"
                >
                  <input
                    className="rounded-lg p-2"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <select
                    className="rounded-lg p-2 bg-gray-300 text-gray-900"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                  >
                    <option value="produce">Produce</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat</option>
                    <option value="pantry">Pantry</option>
                    <option value="frozen">Frozen</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    className="rounded-lg p-2"
                    type="number"
                    min="1"
                    value={editForm.quantity}
                    onChange={(e) =>
                      setEditForm({ ...editForm, quantity: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg p-2"
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, expiryDate: e.target.value })
                    }
                  />
                  <div className="flex space-x-3">
                    <Button type="submit" variant="secondary" size="small">
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{item.name}</h1>
                  <h2 className="text-lg font-semibold text-gray-200">
                    Added By: {item.addedBy?.name}
                  </h2>
                  <h3 className="text-lg font-medium text-gray-300">
                    {item.category}
                  </h3>
                  <p className="text-sm font-medium text-gray-300">
                    {item.quantity}
                  </p>
                  <p className="text-sm font-medium text-gray-300">
                    Use by: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium text-gray-300">
                    status: {item.status}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => startEdit(item)}
                    >
                      Update Item
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => deleteItem(item._id)}
                    >
                      Delete Item
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => markItem(item._id, "used")}
                    >
                      Mark Used
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => markItem(item._id, "wasted")}
                    >
                      Mark Wasted
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          <h1 className="sm:text-lg lg:text-xl md:text-2xl p-4 text-slate-800">
            No items found.
          </h1>
          <Button onClick={() => navigate("/add")}>Add Items</Button>
        </div>
      )}
    </div>
  );
}
