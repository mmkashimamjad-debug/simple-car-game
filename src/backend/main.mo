import Runtime "mo:core/Runtime";

actor {
  var highScore = 0;

  public func getHighScore() : async Nat {
    highScore;
  };

  public func submitScore(distance : Nat) : async () {
    if (distance <= highScore) {
      Runtime.trap("The score must be higher than the current high score to update it.");
    };
    highScore := distance;
  };
};
