import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import React from 'react';

interface MyProfileProps {
  onClose: () => void; // Prop to handle closing the profile
}

const MyProfile: React.FC<MyProfileProps> = ({ onClose }) => {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return <div>No user data available</div>;
  }

  return (
      <Card className="w-full max-w-sm mx-auto absolute z-10 ml-8 mt-8">
      <Button variant="ghost" onClick={onClose} className="absolute top-2 right-2">
        X
      </Button>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Avatar className="w-32 h-32 mb-4">
            <AvatarImage src={session.user.image} />
            <AvatarFallback>
              <img src="/static/backup-avatar.png" alt="User Avatar" />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg">{session.user.name}</h2>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
          <Button className="mt-4" onClick={() => signOut()}>Sign out</Button>
        </CardContent>
      </Card>
  );
};

export default MyProfile;
