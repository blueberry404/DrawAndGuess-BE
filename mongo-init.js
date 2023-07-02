db.createUser(
    {
        user: "anum",
        pwd: "Test123",
        roles: [
            {
                role: "readWrite",
                db: "drawnguess"
            }
        ]
    }
);