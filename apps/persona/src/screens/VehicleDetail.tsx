import { useNavigate, useParams } from "react-router-dom";
import { DetailBody } from "./DetailBody";

export function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <DetailBody vehicleId={id!} onBack={() => navigate(-1)} />;
}
