import { useEffect, useState, useCallback } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/context";
import toast from "react-hot-toast";
import axios from "axios";
import { API_PATHS } from "../utils/apiPath";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Household() {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const { token } = useContext(AuthContext);

  const navigate = useNavigate();

  const fetchMembers = useCallback(
    async (householdId) => {
      const res = await axios.get(API_PATHS.HOUSEHOLD.ALL(householdId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data.members || []);
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchHousehold = async () => {
      try {
        const res = await axios.get(API_PATHS.HOUSEHOLD.MY, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentHousehold = res.data.household;
        setHousehold(currentHousehold);
        await fetchMembers(currentHousehold._id);
      } catch (err) {
        if (err.response?.status === 400) {
          setHousehold(null);
          setMembers([]);
          return;
        }
        toast.error(err.response?.data?.message || err.message);
      }
    };
    fetchHousehold();
  }, [token, navigate, fetchMembers]);

  const createHousehold = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Missing required fields");
      return;
    }
    try {
      const res = await axios.post(
        API_PATHS.HOUSEHOLD.CREATE,
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data) {
        toast.success("Household created successfully");
        const currentHousehold = res.data.household;
        setHousehold(currentHousehold);
        await fetchMembers(currentHousehold._id);
      }
      return;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const joinHousehold = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("Missing required fields");
      return;
    }
    try {
      const res = await axios.post(
        API_PATHS.HOUSEHOLD.JOIN,
        { inviteCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data) {
        const currentHousehold = res.data.household;
        setHousehold(currentHousehold);
        await fetchMembers(currentHousehold._id);
        toast.success("Household joined!");
      }
      return;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        {household && (
          <div className="flex flex-col">
            <div className="mx-3 cursor-pointer space-y-5 my-5 rounded-lg p-4 border-2 border-black text-white bg-blue-950">
              <h1 className="text-xl font-semibold">{household.name}</h1>
              <h2 className="text-xl font-medium">
                Invite Code: {household.inviteCode}
              </h2>
              <p className="text-sm">Waste Score:{household.wasteScore}</p>
              <Button
                variant="secondary"
                size="small"
                onClick={() => navigate("/items")}
              >
                See items
              </Button>
            </div>
            <div className="mx-3 rounded-lg border-2 border-black p-4">
              <h2 className="text-xl font-semibold">Members</h2>
              <div className="mt-3 flex flex-col gap-3">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="rounded-md border border-slate-300 p-3"
                  >
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-slate-600">{member.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {!household && (
          <div className="w-full space-y-5">
            <h1 className="text-3xl font-semibold">
              No Household found! Create or join one
            </h1>
            <div className="text-white bg-blue-950 rounded-lg p-4">
              <h1>Create New Household</h1>
              <form onSubmit={createHousehold}>
                <Input
                  label={"Household Name"}
                  type={"text"}
                  placeholder={"Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button type={"submit"} size="small" variant="secondary">
                  Create Household
                </Button>
              </form>
            </div>
            <div className="text-white bg-blue-950 rounded-lg p-4">
              <h1>Create New Household</h1>
              <form onSubmit={joinHousehold}>
                <Input
                  label={"Invite Code"}
                  type={"text"}
                  placeholder={"Invite Code"}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <Button type={"submit"} size="small" variant="secondary">
                  Join Household
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
