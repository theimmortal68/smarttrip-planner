function combineDateAndTime(date, time) {
  if (!date && !time) return null;
  if (!date) return null; 

  const safeTime = time && time.trim() !== "" ? time : "00:00";


  const [hRaw, mRaw] = safeTime.split(":");
  const hours = hRaw.toString().padStart(2, "0");
  const minutes = mRaw ? mRaw.toString().padStart(2, "0") : "00";

  return `${date} ${hours}:${minutes}:00`;
}

function splitDateTime(dbValue) {
  if (!dbValue) return { date: null, time: null };


  let raw = dbValue;
  if (raw instanceof Date) {

    const iso = raw.toISOString(); 
    const [d, t] = iso.split("T");
    return { date: d, time: t.slice(0, 5) };
  }


  const parts = raw.split(" ");
  const date = parts[0];
  const timePart = parts[1] || "00:00:00";

  return {
    date,
    time: timePart.slice(0, 5),
  };
}

module.exports = {
  combineDateAndTime,
  splitDateTime,
};