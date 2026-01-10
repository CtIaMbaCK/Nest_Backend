-- CreateTable
CREATE TABLE "communication_posts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_posts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "communication_posts" ADD CONSTRAINT "communication_posts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
