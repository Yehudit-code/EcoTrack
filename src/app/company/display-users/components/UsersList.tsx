"use client";

import UserCard from "./UserCard";
import styles from "../page.module.css";

export default function UsersList({ users, onToggleTalk }: any) {
  if (users.length === 0)
    return <p className={styles.noUsers}>No users found.</p>;

  return (
    <div className={styles.userList}>
      {users.map((user: any) => (
        <UserCard
          key={user.email}
          user={user}
          onToggleTalk={() => onToggleTalk(user.email)}
        />
      ))}
    </div>
  );
}
