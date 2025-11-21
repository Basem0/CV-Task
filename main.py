import matplotlib.pyplot as plt

points = [
    (0,0,0),(0,1,0),(0,2,0),(0,3,0),(0,4,0),
    (1,4,0),(2,4,0),(3,4,0),(1,2,0),(2,2,0),
    (1,0,0),(2,0,0),(3,0,0),(0,0,1),(0,0,2),
    (0,0,3),(0,0,4),(1,0,4),(2,0,4),(3,0,4),
    (1,0,2),(2,0,2),(1,0,0),(2,0,0),(3,0,0),
    (0,0,0),(0,1,0),(0,2,0),(0,3,0),(0,4,0),
    (0,0,1),(0,0,2),(0,4,4),(0,0,1),(0,0,2),
    (0,0,3),(0,1,4),(0,3,4),(0,2,4)

]

xs, ys, zs = zip(*points)

fig = plt.figure(figsize=(10,8))

# 3D scatter plot
ax3d = fig.add_subplot(221, projection='3d')
ax3d.scatter(xs, ys, zs, c='purple')
ax3d.set_title('3D')
ax3d.set_xlabel('X'); ax3d.set_ylabel('Y'); ax3d.set_zlabel('Z')
ax3d.grid(True)

# XY scatter plot
ax_xy = fig.add_subplot(222)
ax_xy.scatter(xs, ys, c='blue')
ax_xy.set_title('XY')
ax_xy.set_xlabel('X'); ax_xy.set_ylabel('Y')
ax_xy.set_aspect('equal', adjustable='box')
ax_xy.grid(True)

# YZ scatter plot
ax_yz = fig.add_subplot(223)
ax_yz.scatter(ys, zs, c='green')
ax_yz.set_title('YZ')
ax_yz.set_xlabel('Y'); ax_yz.set_ylabel('Z')
ax_yz.set_aspect('equal', adjustable='box')
ax_yz.grid(True)

# XZ scatter plot
ax_xz = fig.add_subplot(224)
ax_xz.scatter(xs, zs, c='red')
ax_xz.set_title('XZ')
ax_xz.set_xlabel('X'); ax_xz.set_ylabel('Z')
ax_xz.set_aspect('equal', adjustable='box')
ax_xz.grid(True)

plt.tight_layout()
plt.show()