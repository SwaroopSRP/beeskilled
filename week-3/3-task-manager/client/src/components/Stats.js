const Stats = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <h4>Total</h4>
        <p className="stat-number">{stats.total}</p>
      </div>
      <div className="stat-card todo">
        <h4>To Do</h4>
        <p className="stat-number">{stats.todo}</p>
      </div>
      <div className="stat-card in-progress">
        <h4>In Progress</h4>
        <p className="stat-number">{stats.inProgress}</p>
      </div>
      <div className="stat-card completed">
        <h4>Completed</h4>
        <p className="stat-number">{stats.completed}</p>
      </div>
      <div className="stat-card high">
        <h4>High Priority</h4>
        <p className="stat-number">{stats.high}</p>
      </div>
    </div>
  );
};

export default Stats;
